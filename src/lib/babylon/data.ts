/*
TAG=1 LEN=2 Value
Action Type:                  TAG 0x77  LEN 00 01      VALUE action type
Finality provider count:      TAG 0xf9  LEN 00 0n      VALUE count
Finality provider list:       TAG 0xf8  LEN 32*n       VALUE n pubkey
Cov key count:                TAG 0xc0  LEN 00 0n      VALUE count
Cov key list:                 TAG 0xc1  LEN 32*n       VALUE n pubkey
staker pk:                    TAG 0x51  LEN 32         VALUE pubkey
cov quorum:                   TAG 0x01  LEN 00 01      VALUE quorum
stake timelock:               TAG 0x71  LEN 00 08      VALUE timelock uint64
unbonding timelock:           TAG 0x72  LEN 00 08      VALUE timelock uint64
slashing fee limit:           TAG 0xfe  LEN 00 08      VALUE limit uint64
unbonding fee limit:          TAG 0xff  LEN 00 08      VALUE limit uint64
*/

/**
 * 将 stakingTxPolicy 参数编码为 TLV 格式的 Buffer
 * @param timelockBlocks 质押时间锁定块数
 * @param finalityProviders 最终性提供者公钥数组
 * @param covenantThreshold 盟约阈值
 * @param covenantPks 盟约公钥数组
 * @returns 编码后的 TLV Buffer
 */
export function encodeStakingTxPolicyToTLV(
  timelockBlocks: number,
  finalityProviders: string[],
  covenantThreshold: number,
  covenantPks: string[]
): Buffer {
  const buffers: Buffer[] = [];

  // Finality provider count: TAG 0xf9 LEN 00 0n VALUE count
  const fpCount = finalityProviders.length;
  buffers.push(Buffer.from([0xf9])); // TAG
  buffers.push(Buffer.from([0x00, fpCount])); // LEN (2 bytes)
  buffers.push(Buffer.from([fpCount])); // VALUE

  // Finality provider list: TAG 0xf8 LEN 32*n VALUE n pubkey
  if (fpCount > 0) {
    buffers.push(Buffer.from([0xf8])); // TAG
    const fpListLen = 32 * fpCount;
    buffers.push(Buffer.from([Math.floor(fpListLen / 256), fpListLen % 256])); // LEN (2 bytes)
    
    // VALUE: n pubkeys (each 32 bytes)
    for (const fp of finalityProviders) {
      const fpBuffer = Buffer.from(fp, 'hex');
      if (fpBuffer.length !== 32) {
        throw new Error(`Invalid finality provider pubkey length: ${fpBuffer.length}, expected 32`);
      }
      buffers.push(fpBuffer);
    }
  }

  // Cov key count: TAG 0xc0 LEN 00 0n VALUE count
  const covCount = covenantPks.length;
  buffers.push(Buffer.from([0xc0])); // TAG
  buffers.push(Buffer.from([0x00, covCount])); // LEN (2 bytes)
  buffers.push(Buffer.from([covCount])); // VALUE

  // Cov key list: TAG 0xc1 LEN 32*n VALUE n pubkey
  if (covCount > 0) {
    buffers.push(Buffer.from([0xc1])); // TAG
    const covListLen = 32 * covCount;
    buffers.push(Buffer.from([Math.floor(covListLen / 256), covListLen % 256])); // LEN (2 bytes)
    
    // VALUE: n pubkeys (each 32 bytes)
    for (const covPk of covenantPks) {
      const covBuffer = Buffer.from(covPk, 'hex');
      if (covBuffer.length !== 32) {
        throw new Error(`Invalid covenant pubkey length: ${covBuffer.length}, expected 32`);
      }
      buffers.push(covBuffer);
    }
  }

  // Cov quorum: TAG 0x01 LEN 00 01 VALUE quorum
  buffers.push(Buffer.from([0x01])); // TAG
  buffers.push(Buffer.from([0x00, 0x01])); // LEN (2 bytes)
  buffers.push(Buffer.from([covenantThreshold])); // VALUE

  // Stake timelock: TAG 0x71 LEN 00 08 VALUE timelock uint64
  buffers.push(Buffer.from([0x71])); // TAG
  buffers.push(Buffer.from([0x00, 0x08])); // LEN (2 bytes)
  // VALUE: uint64 big-endian
  const timelockBuffer = Buffer.alloc(8);
  timelockBuffer.writeUInt32BE(Math.floor(timelockBlocks / 0x100000000), 0); // 高32位
  timelockBuffer.writeUInt32BE(timelockBlocks % 0x100000000, 4); // 低32位
  buffers.push(timelockBuffer);

  return Buffer.concat(buffers as Uint8Array[]);
}
