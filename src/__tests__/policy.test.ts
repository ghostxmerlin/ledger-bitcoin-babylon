import Transport from '@ledgerhq/hw-transport-node-speculos-http';
import { stakingTxPolicy } from '../lib/babylon/index';

describe('stakingTxPolicy', () => {
  let transport: any;

  beforeAll(async () => {
    transport = await Transport.open('http://127.0.0.1:5000' as any);
  });

  afterAll(async () => {
    if (transport) await transport.close();
  });

  it('should create staking tx policy and send TLV data', async () => {
    const params = {
      timelockBlocks: 64000,
      finalityProviders: ['1f93235732e64cac33569ad1c3dbf041382c3b774fcfb0533b9b31d4c2a76bf9'],
      covenantThreshold: 6,
      covenantPks: [
        '0aee0509b16db71c999238a4827db945526859b13c95487ab46725357c9a9f25',
        '113c3a32a9d320b72190a04a020a0db3976ef36972673258e9a38a364f3dc3b0',
        '17921cf156ccb4e73d428f996ed11b245313e37e27c978ac4d2cc21eca4672e4',
        '3bb93dfc8b61887d771f3630e9a63e97cbafcfcc78556a474df83a31a0ef899c',
        '40afaf47c4ffa56de86410d8e47baa2bb6f04b604f4ea24323737ddc3fe092df',
        '79a71ffd71c503ef2e2f91bccfc8fcda7946f4653cef0d9f3dde20795ef3b9f0',
        '8c1e7e2b5c6d4f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a',
        '9f8e7d6c5b4a39281716151413121110ffeeddccbbaa99887766554433221100',
        'abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      ],
    };

    const policy = await stakingTxPolicy({
      policyName: 'Staking transaction',
      transport,
      params,
      derivationPath: `m/86'/1'/0'`,
      isTestnet: true,
    });

    expect(policy).toBeDefined();
    expect(policy.descriptorTemplate).toBe('tr(@0/**)');
  });
});