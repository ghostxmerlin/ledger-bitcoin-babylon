import Transport from '@ledgerhq/hw-transport-node-speculos-http';
import { AppClient } from '../lib/appClient';


describe('AppClient with Speculos', () => {
  let transport: any;
  let app: AppClient;

  beforeAll(async () => {
    transport = await Transport.open('http://127.0.0.1:5000' as any);
    app = new AppClient(transport);
  });

  afterAll(async () => {
    if (transport) await transport.close();
  });

  it('send merkleized 1024 bytes', async () => {
    const buffer = Buffer.alloc(1024, 0xab);
    const response = await app.dataPrepare(0xbb, buffer);
    
    // 现在可以正确读取状态字
    const sw = response.readUInt16BE(response.length - 2);
    expect(sw).toBe(0x9000);
  });
});