class RewardsMonitor {
    constructor() {
        this.web3 = new Web3(CONFIG.CONTRACT.RPC_URL);
        this.bloveContract = new this.web3.eth.Contract(CONTRACT_ABI, CONFIG.CONTRACT.ADDRESS);
        this.rewardsAddress = CONFIG.CONTRACT.PLATFORM_REWARDS_ADDRESS;
        
        // Initialize reward phases
        this.REWARD_PHASES = {
            1: { threshold: '1000000000000000000000000', amount: '250000000000000000' }, // 1M BLOVE
            2: { threshold: '500000000000000000000000', amount: '200000000000000000' },  // 500K BLOVE
            3: { threshold: '0', amount: '150000000000000000' }                          // < 500K BLOVE
        };

        this.updateRewardsInfo();
        // Update every 2 minutes
        setInterval(() => this.updateRewardsInfo(), 2 * 60 * 1000);
    }

    async getCurrentPhase(supply) {
        const supplyBN = new this.web3.utils.BN(supply);
        
        if (supplyBN.gte(new this.web3.utils.BN(this.REWARD_PHASES[1].threshold))) return 1;
        if (supplyBN.gte(new this.web3.utils.BN(this.REWARD_PHASES[2].threshold))) return 2;
        return 3;
    }

    async updateRewardsInfo() {
        try {
            // Get platform rewards balance
            const supply = await this.bloveContract.methods.balanceOf(this.rewardsAddress).call();
            const currentPhase = await this.getCurrentPhase(supply);
            const rewardAmount = this.REWARD_PHASES[currentPhase].amount;

            // Update CONFIG
            CONFIG.REWARDS.socialRewards.platforms.x.reward = rewardAmount;
            CONFIG.REWARDS.socialRewards.platforms.instagram.reward = rewardAmount;

            // Update UI
            this.updateUI({
                supply: supply,
                supplyFormatted: this.web3.utils.fromWei(supply, 'ether'),
                currentPhase: currentPhase,
                rewardAmount: rewardAmount,
                rewardAmountFormatted: this.web3.utils.fromWei(rewardAmount, 'ether')
            });
        } catch (error) {
            console.error('Error updating rewards info:', error);
        }
    }

    updateUI(data) {
        // Update reward amount displays
        document.querySelectorAll('.reward-amount').forEach(element => {
            element.textContent = `${data.rewardAmountFormatted} BLOVE`;
        });

        // Update platform rewards supply
        const supplyElement = document.getElementById('platform-rewards-supply');
        if (supplyElement) {
            supplyElement.textContent = `${Number(data.supplyFormatted).toLocaleString()} BLOVE`;
        }

        // Update phase indicator
        const phaseElement = document.getElementById('current-phase');
        if (phaseElement) {
            phaseElement.textContent = `Phase ${data.currentPhase}`;
        }

        // Update progress bar if it exists
        const progressElement = document.getElementById('rewards-progress');
        if (progressElement) {
            const maxSupply = this.web3.utils.fromWei(this.REWARD_PHASES[1].threshold, 'ether');
            const percentage = (Number(data.supplyFormatted) / Number(maxSupply)) * 100;
            progressElement.style.width = `${Math.min(percentage, 100)}%`;
        }
    }
}

// Initialize rewards monitor when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.rewardsMonitor = new RewardsMonitor();
});
