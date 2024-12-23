const express = require('express');
const ethers = require('ethers');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { Redis } = require('ioredis');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(cors());

// Redis client for tracking rewards and rate limiting
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Rate limiting middleware - 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});

// Specific rate limit for reward claims - 2 per day per wallet
const rewardLimiter = async (req, res, next) => {
    const { userAddress } = req.body;
    if (!userAddress) return res.status(400).json({ error: 'Wallet address required' });

    const today = new Date().toISOString().split('T')[0];
    const key = `rewards:${userAddress}:${today}`;
    
    try {
        const claims = await redis.incr(key);
        await redis.expire(key, 24 * 60 * 60); // Expire after 24 hours
        
        if (claims > 2) {
            return res.status(429).json({ 
                error: 'Daily reward limit reached. Maximum 2 claims per day.'
            });
        }
        next();
    } catch (error) {
        console.error('Rate limiting error:', error);
        next();
    }
};

app.use(apiLimiter);

// Load environment variables
require('dotenv').config();

const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;
const BLOVE_CONTRACT_ADDRESS = process.env.BLOVE_CONTRACT_ADDRESS;
const wallet = new ethers.Wallet(SIGNER_PRIVATE_KEY);

// Anti-abuse: Track used proofs with TTL
async function isProofUsed(proof) {
    const exists = await redis.exists(`proof:${proof}`);
    return exists === 1;
}

async function markProofAsUsed(proof) {
    // Store proof with 30-day expiration
    await redis.setex(`proof:${proof}`, 30 * 24 * 60 * 60, '1');
}

// Generate verification code for a wallet
async function generateVerificationCode(userAddress) {
    const timestamp = Date.now();
    const hash = crypto.createHash('sha256')
        .update(`${userAddress}${timestamp}${process.env.VERIFICATION_SECRET}`)
        .digest('hex')
        .substring(0, 8);
    
    // Store the verification code with 1-hour expiration
    await redis.setex(`verify:${userAddress}`, 3600, hash);
    return hash;
}

// Get verification code endpoint
app.get('/api/verification-code/:address', async (req, res) => {
    try {
        const { address } = req.params;
        
        if (!ethers.utils.isAddress(address)) {
            return res.status(400).json({ error: 'Invalid Ethereum address' });
        }

        const code = await generateVerificationCode(address);
        res.json({ 
            code,
            message: 'Include this code in your tweet along with blove.com'
        });
    } catch (error) {
        console.error('Error generating verification code:', error);
        res.status(500).json({ error: 'Failed to generate verification code' });
    }
});

// Verify Twitter posts
async function verifyTwitterPost(url, userAddress) {
    if (!url.match(/^https?:\/\/(twitter\.com|x\.com)\/[\w\d_]+\/status\/\d+$/i)) {
        throw new Error('Invalid Twitter URL format');
    }

    // Get the stored verification code
    const storedCode = await redis.get(`verify:${userAddress}`);
    if (!storedCode) {
        throw new Error('Verification code expired or not found');
    }

    // Extract tweet ID from URL
    const tweetId = url.split('/').pop();

    // Store the verified tweet ID to prevent reuse
    const tweetKey = `tweet:${tweetId}`;
    const tweetUsed = await redis.exists(tweetKey);
    
    if (tweetUsed) {
        throw new Error('This tweet has already been used for verification');
    }

    // Mark tweet as used (30-day expiration)
    await redis.setex(tweetKey, 30 * 24 * 60 * 60, userAddress);

    return true;
}

// Reward calculation based on current phase
async function calculateReward(phase) {
    const REWARD_PHASES = {
        1: ethers.utils.parseEther('0.25'),
        2: ethers.utils.parseEther('0.20'),
        3: ethers.utils.parseEther('0.15')
    };
    return REWARD_PHASES[phase] || REWARD_PHASES[3];
}

// Endpoint to verify and reward shares
app.post('/api/verify-share', rewardLimiter, async (req, res) => {
    try {
        const { platform, proof, userAddress } = req.body;

        // Input validation
        if (!platform || !proof || !userAddress) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate Ethereum address
        if (!ethers.utils.isAddress(userAddress)) {
            return res.status(400).json({ error: 'Invalid Ethereum address' });
        }

        // Check if proof was already used
        if (await isProofUsed(proof)) {
            return res.status(400).json({ error: 'This proof has already been used' });
        }

        // Verify the social post
        const isValid = await verifyTwitterPost(proof, userAddress);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid or unverifiable proof' });
        }

        // Mark proof as used
        await markProofAsUsed(proof);

        // Calculate reward based on current phase
        const currentPhase = await getCurrentPhase(); // Implement this based on your needs
        const rewardAmount = await calculateReward(currentPhase);

        // Send reward transaction
        // Note: Implement actual blockchain transaction here
        const transaction = {
            to: userAddress,
            value: rewardAmount,
            // Add other transaction parameters
        };

        // Log successful reward
        await redis.lpush('reward_logs', JSON.stringify({
            userAddress,
            platform,
            amount: rewardAmount.toString(),
            timestamp: Date.now(),
            proof
        }));

        res.json({
            success: true,
            reward: ethers.utils.formatEther(rewardAmount),
            message: 'Reward will be sent to your wallet'
        });

    } catch (error) {
        console.error('Reward processing error:', error);
        res.status(500).json({ error: 'Failed to process reward' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
