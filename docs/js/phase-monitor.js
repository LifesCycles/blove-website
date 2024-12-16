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
        
        this.init();
    }
    
    init() {
        const phaseMonitor = document.getElementById('phase-monitor');
        if (!phaseMonitor) return;
        
        // Add title and description
        phaseMonitor.innerHTML = `
            <div class="phase-header animate-on-scroll">
                <h2>Evolution Phases</h2>
                <p>Journey to Community-Driven Governance</p>
            </div>
            <div class="phases-timeline"></div>
        `;
        
        const timeline = phaseMonitor.querySelector('.phases-timeline');
        
        // Add each phase
        this.phases.forEach((phase, index) => {
            const phaseCard = document.createElement('div');
            phaseCard.className = `phase-card animate-on-scroll ${phase.active ? 'active' : ''} ${phase.isGovernance ? 'governance' : ''}`;
            phaseCard.style.animationDelay = `${index * 0.2}s`;
            
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
                        <div class="feature-list">
                            ${phase.features.map(feature => `
                                <div class="feature-item">
                                    <i class="fas fa-check"></i>
                                    <span>${feature}</span>
                                </div>
                            `).join('')}
                        </div>
                        ${phase.isGovernance ? `
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
                            </div>
                        ` : ''}
                    </div>
                    ${!phase.isGovernance ? `
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress" style="width: ${phase.progress}%"></div>
                            </div>
                            <div class="progress-info">
                                <span class="progress-text">${phase.progress}% Complete</span>
                                <span class="next-phase">Next Phase at ${phase.priceThreshold}</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
            
            timeline.appendChild(phaseCard);
        });
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    new PhaseMonitor();
});
