const BLOVE_CONTRACT_ADDRESS = ''; // Add your contract address after deployment
const REWARD_SERVER = 'http://localhost:3000';

class SocialRewards {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.init();
    }

    async init() {
        if (typeof window.ethereum === 'undefined') {
            alert('Please install MetaMask to use this feature!');
            return;
        }

        try {
            // Connect to provider
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.signer = this.provider.getSigner();
            
            // Initialize contract
            const BLOVEContract = await fetch('contracts/BlockTrove.json')
                .then(res => res.json());
            this.contract = new ethers.Contract(
                BLOVE_CONTRACT_ADDRESS,
                BLOVEContract.abi,
                this.signer
            );

            this.setupEventListeners();
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    setupEventListeners() {
        const twitterForm = document.getElementById('twitter-share-form');
        const discordForm = document.getElementById('discord-share-form');

        twitterForm?.addEventListener('submit', (e) => this.handleSocialShare(e, 'twitter'));
        discordForm?.addEventListener('submit', (e) => this.handleSocialShare(e, 'discord'));
    }

    async handleSocialShare(event, platform) {
        event.preventDefault();
        const urlInput = event.target.querySelector('input[type="url"]');
        const submitButton = event.target.querySelector('button[type="submit"]');
        const statusDiv = event.target.querySelector('.status');

        try {
            submitButton.disabled = true;
            statusDiv.textContent = 'Verifying share...';

            const userAddress = await this.signer.getAddress();
            const proof = urlInput.value;

            // Get signature from backend
            const response = await fetch(`${REWARD_SERVER}/api/verify-share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    platform,
                    proof,
                    userAddress
                })
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Verification failed');
            }

            statusDiv.textContent = 'Claiming reward...';

            // Claim reward on-chain
            const tx = await this.contract.claimSocialReward(
                platform,
                proof,
                data.signature
            );
            await tx.wait();

            statusDiv.textContent = `Success! You earned ${data.reward}`;
            urlInput.value = '';

        } catch (error) {
            console.error('Error:', error);
            statusDiv.textContent = `Error: ${error.message}`;
        } finally {
            submitButton.disabled = false;
        }
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.socialRewards = new SocialRewards();
});
