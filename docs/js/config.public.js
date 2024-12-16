// Public configuration
const CONFIG = {
    // Network configuration
    NETWORK: {
        ID: 8453,  // Base Mainnet
        NAME: 'Base',
        RPC_URL: 'https://mainnet.base.org',  // Public RPC URL
    },
    
    // Contract configuration
    CONTRACT: {
        ADDRESS: null,  // Will be set after deployment
        PLATFORM_REWARDS_ADDRESS: null,  // Will be set after deployment
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
        TWITTER_TEXT: 'Join me on #BLOVE - the community-driven token on Base! ',
        INSTAGRAM_TEXT: ' Join me on BLOVE - the community-driven token on Base!'
    },
    
    // Rewards configuration
    REWARDS: {
        socialRewards: {
            maxRewardsPerWallet: 2, // Changed from 5 to 2 since we have 2 platforms
            rewardIntervalHours: 24,
            platforms: {
                x: {
                    shareText: "Join me on #BLOVE - the community-driven token on Base! \n\nEarn rewards by being an active community member!\n\nUse my referral link: ",
                    reward: "250000000000000000" // Default value, will be updated dynamically
                },
                instagram: {
                    shareText: "\n Join me on BLOVE - the community-driven token on Base!\n\n Earn rewards by being an active community member!\n\n Use my referral link: [LINK]\n\n#BLOVE #Base #Crypto #CommunityFirst",
                    reward: "250000000000000000" // Default value, will be updated dynamically
                }
            }
        }
    }
};

// Freeze the config object to prevent modifications
Object.freeze(CONFIG.NETWORK);
Object.freeze(CONFIG.CONTRACT);
Object.freeze(CONFIG.WALLET);
Object.freeze(CONFIG.SHARE);
Object.freeze(CONFIG.REWARDS);
Object.freeze(CONFIG.REWARDS.socialRewards);
Object.freeze(CONFIG.REWARDS.socialRewards.platforms);
Object.freeze(CONFIG.REWARDS.socialRewards.platforms.x);
Object.freeze(CONFIG.REWARDS.socialRewards.platforms.instagram);
Object.freeze(CONFIG);
