require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const Web3 = require('web3');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure Web3
const web3 = new Web3(process.env.BASE_RPC_URL || 'https://mainnet.base.org');
const BLOVE_CONTRACT_ADDRESS = process.env.BLOVE_CONTRACT_ADDRESS;
const PLATFORM_REWARDS_ADDRESS = process.env.PLATFORM_REWARDS_ADDRESS;

// Load contract ABIs
const bloveABI = require('../docs/js/contract-abi.js');
const bloveContract = new web3.eth.Contract(bloveABI, BLOVE_CONTRACT_ADDRESS);

// Reward phases configuration
const REWARD_PHASES = {
    1: { amount: '250000000000000000' }, // 0.25 BLOVE
    2: { amount: '200000000000000000' }, // 0.20 BLOVE
    3: { amount: '150000000000000000' }  // 0.15 BLOVE
};

// Get current reward phase based on platform rewards supply
async function getCurrentPhase() {
    try {
        const supply = await bloveContract.methods.balanceOf(PLATFORM_REWARDS_ADDRESS).call();
        const supplyInEther = web3.utils.fromWei(supply, 'ether');
        
        // Define phase thresholds
        if (supplyInEther > 1000000) return 1;  // > 1M BLOVE
        if (supplyInEther > 500000) return 2;   // > 500K BLOVE
        return 3;                               // <= 500K BLOVE
    } catch (error) {
        console.error('Error getting current phase:', error);
        return 1; // Default to phase 1
    }
}

// API Endpoints
app.get('/api/platform-rewards/status', async (req, res) => {
    try {
        const supply = await bloveContract.methods.balanceOf(PLATFORM_REWARDS_ADDRESS).call();
        const currentPhase = await getCurrentPhase();
        const rewardAmount = REWARD_PHASES[currentPhase].amount;

        res.json({
            success: true,
            data: {
                supply: supply,
                supplyFormatted: web3.utils.fromWei(supply, 'ether'),
                currentPhase: currentPhase,
                rewardAmount: rewardAmount,
                rewardAmountFormatted: web3.utils.fromWei(rewardAmount, 'ether')
            }
        });
    } catch (error) {
        console.error('Error fetching platform rewards status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch platform rewards status'
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
