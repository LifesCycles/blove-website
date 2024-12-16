// Public configuration
const CONFIG = {
    // Network configuration
    NETWORK: {
        ID: 8453,  // Base network ID
        NAME: 'Base',
        RPC_URL: 'https://mainnet.base.org',
    },
    
    // Contract configuration will be set after deployment
    CONTRACT: {
        ADDRESS: null,  // Will be set after deployment
    },
    
    // Wallet configuration
    WALLET: {
        CONNECT_OPTIONS: {
            method: 'eth_requestAccounts'
        }
    }
};

// Freeze the config object to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.NETWORK);
Object.freeze(CONFIG.CONTRACT);
Object.freeze(CONFIG.WALLET);
