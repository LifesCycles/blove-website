class WalletHandler {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.networkId = CONFIG.NETWORK.ID;
        this.contractAddress = CONFIG.CONTRACT.ADDRESS;
        this.minTransaction = CONFIG.WALLET.MIN_TRANSACTION;
        this.maxDailyTransactions = CONFIG.WALLET.MAX_DAILY_TRANSACTIONS;
        
        // Initialize state
        this._resetState();
    }

    _resetState() {
        this.lastRequest = 0;
        this.requestCount = 0;
        this.isConnecting = false;
    }

    async init() {
        // Check if MetaMask is installed
        if (typeof window.ethereum !== 'undefined') {
            // Listen for account changes
            window.ethereum.on('accountsChanged', this.handleAccountsChanged);
            
            // Check if already connected
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    this.handleAccountsChanged(accounts);
                }
            } catch (error) {
                console.error('Error checking accounts:', error);
            }
        }
    }
    
    async connectWallet() {
        try {
            // Prevent multiple connection attempts
            if (this.isConnecting) {
                throw new Error('Connection in progress');
            }
            this.isConnecting = true;

            // Check if MetaMask is installed
            if (typeof window.ethereum === 'undefined') {
                throw new Error('Please install MetaMask to connect your wallet');
            }

            // Check rate limiting
            if (!this._checkRateLimit()) {
                throw new Error('Too many requests. Please try again later.');
            }

            // Request account access
            const accounts = await window.ethereum.request(CONFIG.WALLET.CONNECT_OPTIONS);
            
            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found');
            }

            this.account = accounts[0];
            this.web3 = new Web3(window.ethereum);

            // Verify network
            const network = await this.web3.eth.net.getId();
            if (network !== this.networkId) {
                throw new Error(`Please connect to ${CONFIG.NETWORK.NAME} network`);
            }

            // Update UI
            this._updateUI();

            // Set up event listeners
            this._setupEventListeners();

            return this.account;
        } catch (error) {
            console.error('Error connecting wallet:', error);
            this._handleError(error);
            throw error;
        } finally {
            this.isConnecting = false;
        }
    }
    
    async verifyWallet() {
        try {
            if (!this.account) {
                throw new Error('Please connect your wallet first');
            }

            // Create a unique message to sign
            const message = this._createVerificationMessage();
            
            // Request signature
            const signature = await this.web3.eth.personal.sign(
                message,
                this.account,
                '' // Empty password for MetaMask
            );

            // Return both message and signature for verification
            return {
                address: this.account,
                message,
                signature
            };
        } catch (error) {
            console.error('Error verifying wallet:', error);
            this._handleError(error);
            throw error;
        }
    }
    
    handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            this.isConnected = false;
            this.account = null;
            this.updateUI(false);
        } else {
            this.isConnected = true;
            this.account = accounts[0];
            this.updateUI(true);
        }
    }
    
    async signMessage(message) {
        if (!this.isConnected) {
            throw new Error('Wallet not connected');
        }
        
        try {
            // Create a unique message to prevent replay attacks
            const timestamp = Date.now();
            const nonce = Math.floor(Math.random() * 1000000);
            const fullMessage = `${message}\nTimestamp: ${timestamp}\nNonce: ${nonce}`;
            
            // Sign the message
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [fullMessage, this.account]
            });
            
            return {
                message: fullMessage,
                signature,
                address: this.account,
                timestamp,
                nonce
            };
        } catch (error) {
            console.error('Error signing message:', error);
            throw error;
        }
    }
    
    updateUI(connected) {
        const connectBtn = document.querySelector('.connect-wallet');
        const walletInput = document.getElementById('walletAddress');
        const shareUrlInput = document.getElementById('shareUrl');
        const verifyBtn = document.getElementById('verifyShare');
        
        if (connected) {
            connectBtn.innerHTML = `<i class="fas fa-wallet"></i> ${this.account.slice(0, 6)}...${this.account.slice(-4)}`;
            walletInput.value = this.account;
            shareUrlInput.disabled = false;
            verifyBtn.disabled = false;
        } else {
            connectBtn.innerHTML = '<i class="fas fa-wallet"></i> Connect';
            walletInput.value = '';
            shareUrlInput.disabled = true;
            verifyBtn.disabled = true;
        }
    }
    
    // Verify a share submission
    async verifyShare(shareUrl) {
        if (!this.isConnected) {
            throw new Error('Please connect your wallet first');
        }
        
        try {
            // Sign a message containing the share URL
            const signedData = await this.signMessage(
                `Verify BLOVE share:\n${shareUrl}`
            );
            
            // This would typically be sent to a backend for verification
            // For now, we'll just return the signed data
            return signedData;
        } catch (error) {
            console.error('Error verifying share:', error);
            throw error;
        }
    }
    
    async distributePlatformRewards(amount) {
        try {
            if (!this.account) {
                throw new Error('Please connect your wallet first');
            }

            // Check rate limiting
            if (!this._checkRateLimit()) {
                throw new Error('Too many requests. Please try again later.');
            }

            // Verify amount is within limits
            if (amount < CONFIG.PLATFORM_REWARDS.MIN_AMOUNT) {
                throw new Error(`Minimum reward amount is ${CONFIG.PLATFORM_REWARDS.MIN_AMOUNT} BLOVE`);
            }
            if (amount > CONFIG.PLATFORM_REWARDS.MAX_AMOUNT) {
                throw new Error(`Maximum reward amount is ${CONFIG.PLATFORM_REWARDS.MAX_AMOUNT} BLOVE`);
            }

            // Check daily limit
            if (!this._checkDailyRewardLimit(amount)) {
                throw new Error(`Daily reward limit of ${CONFIG.PLATFORM_REWARDS.DAILY_LIMIT} BLOVE exceeded`);
            }

            // Create contract instance
            const contract = new this.web3.eth.Contract(BLOVE_ABI, this.contractAddress);

            // Check if platform rewards are enabled
            const rewardsEnabled = await contract.methods.platformRewardsEnabled().call();
            if (!rewardsEnabled) {
                throw new Error('Platform rewards are not enabled');
            }

            // Check platform rewards balance
            const rewardsBalance = await contract.methods.platformRewardsBalance().call();
            if (rewardsBalance < amount) {
                throw new Error('Insufficient platform rewards balance');
            }

            // Get max reward amount
            const maxReward = await contract.methods.maxPlatformReward().call();
            if (amount > maxReward) {
                throw new Error(`Amount exceeds maximum platform reward of ${maxReward} BLOVE`);
            }

            // Estimate gas
            const gasEstimate = await contract.methods.distributePlatformRewards(this.account, amount)
                .estimateGas({ from: this.account });

            // Call PLATFORM_REWARDS distribution
            const tx = await contract.methods.distributePlatformRewards(this.account, amount)
                .send({ 
                    from: this.account,
                    gasLimit: Math.min(gasEstimate * 1.2, CONFIG.PLATFORM_REWARDS.GAS_LIMIT) // Add 20% buffer but cap at max
                });

            // Update rewards tracking
            this._updateRewardsTracking(amount);

            // Emit event for UI updates
            this._emitRewardEvent(tx.transactionHash, amount);

            return tx;
        } catch (error) {
            console.error('Error distributing rewards:', error);
            this._handleError(error);
            throw error;
        }
    }

    _checkDailyRewardLimit(amount) {
        const now = Date.now();
        
        // Reset counter if day has passed
        if (now - this.platformRewards.timestamp > 24 * 60 * 60 * 1000) {
            this.platformRewards = {
                timestamp: now,
                totalAmount: amount
            };
            return true;
        }

        // Check if new amount would exceed daily limit
        const newTotal = this.platformRewards.totalAmount + amount;
        if (newTotal > CONFIG.PLATFORM_REWARDS.DAILY_LIMIT) {
            return false;
        }

        return true;
    }

    _updateRewardsTracking(amount) {
        const now = Date.now();
        
        // Reset if day has passed
        if (now - this.platformRewards.timestamp > 24 * 60 * 60 * 1000) {
            this.platformRewards = {
                timestamp: now,
                totalAmount: amount
            };
        } else {
            this.platformRewards.totalAmount += amount;
        }
    }

    _emitRewardEvent(txHash, amount) {
        const event = new CustomEvent('platformReward', {
            detail: {
                txHash,
                amount,
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(event);
    }

    // Private helper methods
    _checkRateLimit() {
        const now = Date.now();
        
        // Reset counter if window has passed
        if (now - this.requests.timestamp > CONFIG.RATE_LIMIT.WINDOW_MS) {
            this.requests = {
                timestamp: now,
                count: 1
            };
            return true;
        }

        // Increment counter
        this.requests.count++;
        
        // Check if over limit
        return this.requests.count <= CONFIG.RATE_LIMIT.MAX_REQUESTS;
    }

    _createVerificationMessage() {
        const timestamp = Date.now();
        const nonce = this._generateNonce();
        return `Verify BLOVE wallet ownership\nTimestamp: ${timestamp}\nNonce: ${nonce}`;
    }

    _generateNonce() {
        return Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    _updateUI() {
        const input = document.getElementById('walletAddress');
        const button = document.querySelector('.connect-wallet');
        
        if (input && this.account) {
            input.value = this.account;
            button.textContent = 'Connected';
            button.disabled = true;
        }
    }

    _setupEventListeners() {
        // Handle account changes
        window.ethereum.on('accountsChanged', (accounts) => {
            this.account = accounts[0] || null;
            this._updateUI();
        });

        // Handle network changes
        window.ethereum.on('networkChanged', (networkId) => {
            if (Number(networkId) !== this.networkId) {
                this._handleError(new Error(`Please connect to ${CONFIG.NETWORK.NAME} network`));
            }
        });
    }

    _handleError(error) {
        console.error('Wallet error:', error.message);
        alert(error.message);
    }
}

// Initialize wallet handler
const walletHandler = new WalletHandler();

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    const connectBtn = document.querySelector('.connect-wallet');
    const verifyBtn = document.getElementById('verifyShare');
    const shareUrlInput = document.getElementById('shareUrl');
    
    connectBtn.addEventListener('click', async () => {
        await walletHandler.connectWallet();
    });
    
    verifyBtn.addEventListener('click', async () => {
        const shareUrl = shareUrlInput.value.trim();
        if (!shareUrl) {
            alert('Please enter a share URL');
            return;
        }
        
        try {
            const verificationData = await walletHandler.verifyShare(shareUrl);
            // This would typically be sent to a backend for verification
            console.log('Share verified:', verificationData);
            alert('Share submitted for verification!');
        } catch (error) {
            alert('Error verifying share: ' + error.message);
        }
    });
});
