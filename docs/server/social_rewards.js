const express = require('express');
const ethers = require('ethers');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Load environment variables
require('dotenv').config();

const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;
const wallet = new ethers.Wallet(SIGNER_PRIVATE_KEY);

// Store used social proofs to prevent duplicates
const usedProofs = new Set();

// Verify social media posts
async function verifySocialPost(platform, url, userAddress) {
    // Add platform-specific verification logic here
    switch (platform) {
        case 'twitter':
            return verifyTwitterPost(url, userAddress);
        case 'discord':
            return verifyDiscordPost(url, userAddress);
        default:
            throw new Error('Unsupported platform');
    }
}

async function verifyTwitterPost(url, userAddress) {
    // Implement Twitter API verification
    // This is a placeholder - you'll need to implement actual Twitter API calls
    const tweetId = url.split('/').pop();
    // Verify tweet exists and contains your website URL
    // Verify tweet is from the claiming user
    return true;
}

async function verifyDiscordPost(url, userAddress) {
    // Implement Discord verification
    // This is a placeholder - you'll need to implement actual Discord API calls
    return true;
}

app.post('/api/verify-share', async (req, res) => {
    try {
        const { platform, proof, userAddress } = req.body;

        // Basic validation
        if (!platform || !proof || !userAddress) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if proof was already used
        const proofKey = `${platform}:${proof}:${userAddress}`;
        if (usedProofs.has(proofKey)) {
            return res.status(400).json({ error: 'Proof already used' });
        }

        // Verify the social media post
        const isValid = await verifySocialPost(platform, proof, userAddress);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid proof' });
        }

        // Create message hash
        const message = ethers.utils.solidityKeccak256(
            ['address', 'string', 'string'],
            [userAddress, platform, proof]
        );

        // Sign the message
        const signature = await wallet.signMessage(ethers.utils.arrayify(message));

        // Store the used proof
        usedProofs.add(proofKey);

        // Return the signature
        res.json({ 
            success: true, 
            signature,
            reward: '10 BLOVE' // 10 tokens per share
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
