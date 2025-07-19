import { ethers } from 'ethers';
import { useGasStore } from '../stores/useGasStore';

export const setupGasListeners = () => {
  const { connectChain, updateGasData } = useGasStore.getState();

  // Ethereum
  const ethProvider = new ethers.WebSocketProvider(process.env.NEXT_PUBLIC_ETHEREUM_RPC_WS as string);
  connectChain('ethereum', ethProvider);

  ethProvider.on('block', async (blockNumber) => {
    const block = await ethProvider.getBlock(blockNumber);
    if (!block.baseFeePerGas) return; // For EIP-1559 chains

    updateGasData('ethereum', {
      baseFee: Number(block.baseFeePerGas) / 1e9, // Gwei
      priorityFee: 2, // Hardcoded for simplicity, or use fee history if needed
      timestamp: block.timestamp,
      blockNumber: block.number
    });
  });

  // Polygon
  const polygonProvider = new ethers.WebSocketProvider(process.env.NEXT_PUBLIC_POLYGON_RPC_WS as string);
  connectChain('polygon', polygonProvider);

  polygonProvider.on('block', async (blockNumber) => {
    const block = await polygonProvider.getBlock(blockNumber);
    if (!block.baseFeePerGas) return;

    updateGasData('polygon', {
      baseFee: Number(block.baseFeePerGas) / 1e9,
      priorityFee: 1.5, // You can adjust this if needed
      timestamp: block.timestamp,
      blockNumber: block.number
    });
  });

  // Arbitrum
  const arbitrumProvider = new ethers.WebSocketProvider(process.env.NEXT_PUBLIC_ARBITRUM_RPC_WS as string);
  connectChain('arbitrum', arbitrumProvider);

  arbitrumProvider.on('block', async (blockNumber) => {
    const gasPrice = await arbitrumProvider.send('eth_gasPrice', []);


    updateGasData('arbitrum', {
      baseFee: Number(gasPrice) / 1e9, // For simplicity, treat Arbitrum's L2 gas as baseFee
      priorityFee: 0, // Arbitrum doesn't have priority fee the same way L1 does
      timestamp: Math.floor(Date.now() / 1000),
      blockNumber
    });
  });
};
