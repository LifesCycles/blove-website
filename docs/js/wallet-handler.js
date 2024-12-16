class WalletHandler {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.isConnecting = false;
    }

    async connectWallet() {
        try {
            if (this.isConnecting) {
                throw new Error('Connection in progress');
            }
            this.isConnecting = true;

            // Check if MetaMask is installed
            if (typeof window.ethereum === 'undefined') {
                throw new Error('Please install MetaMask');
            }

            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found');
            }

            this.account = accounts[0];
            this.web3 = new Web3(window.ethereum);

            // Update UI
            this._updateUI();

            // Set up event listeners
            this._setupEventListeners();

            return this.account;
        } catch (error) {
            console.error('Wallet error:', error.message);
            throw error;
        } finally {
            this.isConnecting = false;
        }
    }

    async signMessage(message) {
        try {
            if (!this.account || !this.web3) {
                throw new Error('Please connect wallet first');
            }

            const signature = await this.web3.eth.personal.sign(
                message,
                this.account,
                ''
            );

            return signature;
        } catch (error) {
            console.error('Signing error:', error.message);
            throw error;
        }
    }

    _updateUI() {
        const addressElem = document.getElementById('walletAddress');
        const connectBtn = document.querySelector('.connect-wallet');
        
        if (addressElem && this.account) {
            // Only show first 6 and last 4 characters of address
            addressElem.value = `${this.account.slice(0,6)}...${this.account.slice(-4)}`;
            connectBtn.textContent = 'Connected';
            connectBtn.disabled = true;
        }
    }

    _setupEventListeners() {
        window.ethereum.on('accountsChanged', (accounts) => {
            this.account = accounts[0] || null;
            this._updateUI();
            window.location.reload();
        });

        window.ethereum.on('chainChanged', () => {
            window.location.reload();
        });
    }
}

// Initialize wallet handler
const walletHandler = new WalletHandler();
