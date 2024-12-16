class SocialRewards {
    constructor() {
        this.baseUrl = CONFIG.SHARE.BASE_URL;
        this.setupEventListeners();
    }

    setupEventListeners() {
        const verifyButton = document.getElementById('verifyShare');
        if (verifyButton) {
            verifyButton.addEventListener('click', () => this.verifyShare());
        }
    }

    generateShareUrl() {
        const params = new URLSearchParams();
        if (walletHandler.account) {
            params.append('ref', walletHandler.account);
        }
        return `${this.baseUrl}?${params.toString()}`;
    }

    async shareOnX() {
        try {
            if (!walletHandler.account) {
                alert('Please connect your wallet first');
                return;
            }

            const shareUrl = this.generateShareUrl();
            const shareText = `Check out BLOVE - A community-driven token on Base network! #BLOVE #Base #Crypto`;
            const shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
            
            window.open(shareLink, '_blank', 'width=550,height=400');
            this.trackShare('x', shareUrl);
        } catch (error) {
            console.error('Error sharing on X:', error);
            alert('Error sharing. Please try again.');
        }
    }

    async copyInstagramShare(event) {
        event.preventDefault();
        
        try {
            if (!walletHandler.account) {
                alert('Please connect your wallet first');
                return;
            }

            const shareUrl = this.generateShareUrl();
            const shareText = `Check out BLOVE - A community-driven token on Base network!\n\n${shareUrl}\n\n#BLOVE #Base #Crypto #Web3 #CommunityRewards`;
            
            await navigator.clipboard.writeText(shareText);
            alert('Share text copied! Open Instagram to paste and share.');
            window.open('https://instagram.com', '_blank');
            this.trackShare('instagram', shareUrl);
        } catch (error) {
            console.error('Error preparing Instagram share:', error);
            alert('Error preparing share. Please try again.');
        }
    }

    async verifyShare() {
        try {
            const shareUrl = document.getElementById('shareUrl').value;
            if (!shareUrl) {
                alert('Please enter your share URL');
                return;
            }

            if (!walletHandler.account) {
                alert('Please connect your wallet first');
                return;
            }

            const message = `Verify BLOVE share:\n${shareUrl}`;
            const signature = await walletHandler.signMessage(message);

            console.log('Share verified:', {
                url: shareUrl,
                wallet: walletHandler.account,
                signature
            });

            alert('Share submitted for verification! You will receive your BLOVE rewards soon.');
        } catch (error) {
            console.error('Error verifying share:', error);
            alert('Error verifying share: ' + error.message);
        }
    }

    async trackShare(platform, shareUrl) {
        try {
            if (!walletHandler.account) {
                throw new Error('Please connect your wallet first');
            }

            const message = `Share verification\nPlatform: ${platform}\nURL: ${shareUrl}`;
            const signature = await walletHandler.signMessage(message);

            console.log('Share tracked:', {
                platform,
                shareUrl,
                wallet: walletHandler.account,
                signature
            });
        } catch (error) {
            console.error('Error tracking share:', error);
        }
    }
}

// Initialize social rewards
const socialRewards = new SocialRewards();
