// Public configuration
const CONFIG = {
    // Network configuration
    NETWORK: {
        ID: 1,  // Ethereum Mainnet
        NAME: 'Ethereum Mainnet',
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
    },
    
    // Share configuration
    SHARE: {
        BASE_URL: 'https://lifecycles.github.io/blove-website',
        TWITTER_TEXT: 'Check out this awesome BLOVE share! ',
        TELEGRAM_TEXT: 'Check out this awesome BLOVE share! '
    }
};

// Freeze the config object to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.NETWORK);
Object.freeze(CONFIG.CONTRACT);
Object.freeze(CONFIG.WALLET);
Object.freeze(CONFIG.SHARE);
