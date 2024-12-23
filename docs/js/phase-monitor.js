class PhaseMonitor {
    constructor() {
        this.phases = [
            {
                id: 1,
                name: "Genesis Launch",
                priceThreshold: "$0.0001",
                supplyInjection: "25,000",
                description: "The beginning of our journey! Building a strong foundation with early adopters and establishing core community values.",
                features: [
                    "Initial token distribution",
                    "Community building",
                    "Platform development"
                ],
                active: true,
                progress: 75,
                icon: "🚀"
            },
            {
                id: 2,
                name: "Ecosystem Growth",
                priceThreshold: "$0.001",
                supplyInjection: "10,000",
                description: "Expanding our reach and building powerful partnerships to strengthen the BLOVE ecosystem.",
                features: [
                    "Strategic partnerships",
                    "Enhanced utilities",
                    "Market expansion"
                ],
                active: false,
                progress: 0,
                icon: "🌱"
            },
            {
                id: 3,
                name: "Global Expansion",
                priceThreshold: "$0.01",
                supplyInjection: "5,000",
                description: "Taking BLOVE to the global stage with major integrations and expanded use cases.",
                features: [
                    "Global partnerships",
                    "Advanced features",
                    "Enhanced security"
                ],
                active: false,
                progress: 0,
                icon: "🌍"
            },
            {
                id: 4,
                name: "Community Governance",
                priceThreshold: "Community Decided",
                supplyInjection: "Community Voted",
                description: "The future of BLOVE in your hands! Community-driven development and governance.",
                features: [
                    "Proposal system",
                    "Democratic voting",
                    "Community treasury"
                ],
                active: false,
                progress: 0,
                icon: "👥",
                isGovernance: true
            }
        ];
        
        // Cache templates
        this.templates = {
            featureItem: feature => `
                <div class="feature-item">
                    <i class="fas fa-check"></i>
                    <span>${feature}</span>
                </div>`,
            governanceInfo: `
                <div class="governance-info">
                    <div class="governance-header">
                        <i class="fas fa-users-cog"></i>
                        <h4>Community Governance</h4>
                    </div>
                    <p>Shape the future of BLOVE through:</p>
                    <ul>
                        <li><i class="fas fa-vote-yea"></i> Democratic voting</li>
                        <li><i class="fas fa-comments"></i> Proposal system</li>
                        <li><i class="fas fa-landmark"></i> Treasury management</li>
                    </ul>
                </div>`,
            progressContainer: (progress, priceThreshold) => `
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${progress}%"></div>
                    </div>
                    <div class="progress-info">
                        <span class="progress-text">${progress}% Complete</span>
                        <span class="next-phase">Next Phase at ${priceThreshold}</span>
                    </div>
                </div>`
        };
        
        this.init();
    }
    
    createPhaseCard(phase, index) {
        const phaseCard = document.createElement('div');
        phaseCard.className = `phase-card animate-on-scroll ${phase.active ? 'active' : ''} ${phase.isGovernance ? 'governance' : ''}`;
        phaseCard.style.animationDelay = `${index * 0.2}s`;
        
        const features = phase.features.map(this.templates.featureItem).join('');
        const governanceSection = phase.isGovernance ? this.templates.governanceInfo : '';
        const progressSection = !phase.isGovernance ? this.templates.progressContainer(phase.progress, phase.priceThreshold) : '';
        
        phaseCard.innerHTML = `
            <div class="phase-icon">${phase.icon}</div>
            <div class="phase-content">
                <div class="phase-header">
                    <h3>Phase ${phase.id}: ${phase.name}</h3>
                    ${phase.active ? '<span class="status active">Current Phase</span>' : ''}
                </div>
                <div class="phase-details">
                    <div class="detail-row">
                        <span class="label">Price Target</span>
                        <span class="value">${phase.priceThreshold}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Supply Boost</span>
                        <span class="value">${phase.supplyInjection} BLOVE</span>
                    </div>
                    <p class="phase-description">${phase.description}</p>
                    <div class="feature-list">${features}</div>
                    ${governanceSection}
                </div>
                ${progressSection}
            </div>`;
            
        return phaseCard;
    }
    
    init() {
        try {
            const phaseMonitor = document.getElementById('phase-monitor');
            if (!phaseMonitor) {
                console.warn('Phase monitor element not found');
                return;
            }
            
            // Create header
            const header = document.createElement('div');
            header.className = 'phase-header animate-on-scroll';
            header.innerHTML = `
                <h2>Evolution Phases</h2>
                <p>Journey to Community-Driven Governance</p>`;
            
            // Create timeline container
            const timeline = document.createElement('div');
            timeline.className = 'phases-timeline';
            
            // Use DocumentFragment for batch insertion
            const fragment = document.createDocumentFragment();
            this.phases.forEach((phase, index) => {
                fragment.appendChild(this.createPhaseCard(phase, index));
            });
            
            timeline.appendChild(fragment);
            
            // Clear and update phase monitor
            phaseMonitor.innerHTML = '';
            phaseMonitor.appendChild(header);
            phaseMonitor.appendChild(timeline);
            
        } catch (error) {
            console.error('Error initializing phase monitor:', error);
        }
    }
}

// Initialize when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new PhaseMonitor());
} else {
    new PhaseMonitor();
}
