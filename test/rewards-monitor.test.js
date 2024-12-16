const { expect } = require('chai');
const { JSDOM } = require('jsdom');
const sinon = require('sinon');

describe('RewardsMonitor', () => {
    let dom;
    let window;
    let document;
    let Web3;
    let rewardsMonitor;

    beforeEach(() => {
        // Setup DOM environment
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            url: 'http://localhost',
            runScripts: 'dangerously'
        });
        window = dom.window;
        document = window.document;

        // Add required HTML elements
        document.body.innerHTML = `
            <div id="current-phase">Phase 1</div>
            <span class="reward-amount">0.25 BLOVE</span>
            <div id="platform-rewards-supply">Loading...</div>
            <div id="rewards-progress" style="width: 100%"></div>
        `;

        // Mock Web3
        Web3 = sinon.stub().returns({
            eth: {
                Contract: sinon.stub().returns({
                    methods: {
                        balanceOf: sinon.stub().returns({
                            call: async () => '1000000000000000000000000' // 1M BLOVE
                        })
                    }
                })
            },
            utils: {
                fromWei: (value) => String(Number(value) / 1e18),
                BN: class {
                    constructor(value) { this.value = value; }
                    gte(other) { return this.value >= other.value; }
                }
            }
        });

        // Mock global objects
        global.window = window;
        global.document = document;
        global.Web3 = Web3;

        // Mock CONFIG with clearly fake test values
        global.CONFIG = {
            CONTRACT: {
                RPC_URL: 'http://localhost:8545', // Local test node
                ADDRESS: '0x0000000000000000000000000000000000000001', // Obviously fake address
                PLATFORM_REWARDS_ADDRESS: '0x0000000000000000000000000000000000000002' // Obviously fake address
            },
            REWARDS: {
                socialRewards: {
                    platforms: {
                        x: { reward: '250000000000000000' },
                        instagram: { reward: '250000000000000000' }
                    }
                }
            }
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should initialize with correct configuration', async () => {
        const { RewardsMonitor } = require('../docs/js/rewards-monitor.js');
        rewardsMonitor = new RewardsMonitor();
        
        expect(Web3.calledWith(CONFIG.CONTRACT.RPC_URL)).to.be.true;
    });

    it('should update UI with correct phase and rewards', async () => {
        const { RewardsMonitor } = require('../docs/js/rewards-monitor.js');
        rewardsMonitor = new RewardsMonitor();
        await rewardsMonitor.updateRewardsInfo();

        const phaseElement = document.getElementById('current-phase');
        const supplyElement = document.getElementById('platform-rewards-supply');
        const rewardElements = document.querySelectorAll('.reward-amount');

        expect(phaseElement.textContent).to.equal('Phase 1');
        expect(supplyElement.textContent).to.equal('1,000,000 BLOVE');
        rewardElements.forEach(element => {
            expect(element.textContent).to.equal('0.25 BLOVE');
        });
    });

    it('should handle different phases based on supply', async () => {
        const { RewardsMonitor } = require('../docs/js/rewards-monitor.js');
        rewardsMonitor = new RewardsMonitor();

        // Test Phase 1 (> 1M BLOVE)
        let phase = await rewardsMonitor.getCurrentPhase('1000000000000000000000000');
        expect(phase).to.equal(1);

        // Test Phase 2 (> 500K BLOVE)
        phase = await rewardsMonitor.getCurrentPhase('500000000000000000000000');
        expect(phase).to.equal(2);

        // Test Phase 3 (< 500K BLOVE)
        phase = await rewardsMonitor.getCurrentPhase('100000000000000000000000');
        expect(phase).to.equal(3);
    });

    it('should handle errors gracefully', async () => {
        // Mock console.error to capture error messages
        const consoleError = sinon.stub(console, 'error');

        // Force an error by making the contract call fail
        Web3.returns({
            eth: {
                Contract: sinon.stub().returns({
                    methods: {
                        balanceOf: sinon.stub().returns({
                            call: async () => { throw new Error('Contract call failed'); }
                        })
                    }
                })
            }
        });

        const { RewardsMonitor } = require('../docs/js/rewards-monitor.js');
        rewardsMonitor = new RewardsMonitor();
        await rewardsMonitor.updateRewardsInfo();

        expect(consoleError.calledWith('Error updating rewards info:', sinon.match.any)).to.be.true;
    });
});
