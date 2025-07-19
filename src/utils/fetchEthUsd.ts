import { ethers } from 'ethers';

// Uniswap V3 ETH/USDC 0.05% Pool
const UNISWAP_POOL = '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640';

// Minimal ABI for Uniswap V3 slot0
const UNISWAP_ABI = [
  "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16, uint16, uint16, uint8, bool)"
];

export const fetchEthUsd = async (): Promise<number> => {
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ETHEREUM_RPC_HTTPS!);

  const pool = new ethers.Contract(UNISWAP_POOL, UNISWAP_ABI, provider);

  const slot0 = await pool.slot0();
  const sqrtPriceX96 = slot0[0];

  // Convert BigInt to JS Number safely
  const price = (BigInt(sqrtPriceX96) * BigInt(sqrtPriceX96) * BigInt(1_000_000_000_000)) / (BigInt(2) ** BigInt(192));

  return Number(price) / 1e6; // Convert back to normal float (USDC has 6 decimals)
};
