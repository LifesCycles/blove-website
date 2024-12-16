class RewardsHandler {
    constructor() {
        this.backendUrl = CONFIG.BACKEND_URL || 'http://localhost:3000';
        this.updateRewardsInfo();
        
        // Update rewards info every 5 minutes
        setInterval(() => this.updateRewardsInfo(), 5 * 60 * 1000);
    }

    async updateRewardsInfo() {
        try {
            const response = await fetch(`${this.backendUrl}/api/platform-rewards/status`);
            const data = await response.json();
            
            if (data.success) {
                // Update reward amount in CONFIG
                CONFIG.REWARDS.socialRewards.platforms.x.reward = data.data.rewardAmount;
                CONFIG.REWARDS.socialRewards.platforms.instagram.reward = data.data.rewardAmount;
                
                // Update UI elements
                this.updateRewardsUI(data.data);
            }
        } catch (error) {
            console.error('Error updating rewards info:', error);
        }
    }

    updateRewardsUI(data) {
        // Update reward amount displays
        const rewardAmountElements = document.querySelectorAll('.reward-amount');
        rewardAmountElements.forEach(element => {
            element.textContent = `${data.rewardAmountFormatted} BLOVE`;
        });

        // Update platform rewards supply
        const supplyElement = document.getElementById('platform-rewards-supply');
        if (supplyElement) {
            supplyElement.textContent = `${Number(data.supplyFormatted).toLocaleString()} BLOVE`;
        }

        // Update phase indicator if needed
        const phaseElement = document.getElementById('current-phase');
        if (phaseElement) {
            phaseElement.textContent = `Phase ${data.currentPhase}`;
        }
    }
}

// Initialize rewards handler
const rewardsHandler = new RewardsHandler();
