/**
 * Shared wallet adapter (ethers v6) — skeleton ตาม Project.md §17.3
 * นรวัฒน์เป็นเจ้าของไฟล์นี้ แล้วส่งให้รัตนพลใช้ร่วมกัน (Team.md §7)
 * หลักการ: ตรวจ chain ทุกครั้งก่อน sign/send; รองรับ account/chain change,
 * user rejection (4001), ไม่มี network (4902), ไม่มี gas
 */
import { BrowserProvider, Contract } from 'ethers';

export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';

export async function connect() {
  if (!window.ethereum) throw new Error('MetaMask not available');
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  await switchToSepolia();
  const provider = new BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  if (network.chainId !== SEPOLIA_CHAIN_ID) throw new Error('Wrong network');
  return provider;
}

export async function switchToSepolia() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    });
  } catch (err) {
    if (err.code === 4902) {
      // TODO(norawat): wallet_addEthereumChain ด้วย RPC ที่ทีมเลือก (Project.md §17.1)
      throw new Error('Sepolia not added in wallet');
    }
    if (err.code === 4001) throw new Error('User rejected request');
    throw err;
  }
}

export function getContract(address, abi, provider) {
  if (!address) throw new Error('CONTRACT_ADDRESS not set — รอ deployment manifest จาก jarukit');
  return new Contract(address, abi, provider);
}

export function etherscanTxUrl(txHash) {
  return `https://sepolia.etherscan.io/tx/${txHash}`;
}

export function etherscanAddressUrl(address) {
  return `https://sepolia.etherscan.io/address/${address}`;
}
