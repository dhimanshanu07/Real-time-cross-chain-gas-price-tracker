import { useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { useGasStore } from '../stores/useGasStore';

const RPC_ENDPOINTS = {
  ethereum: 'wss://eth-mainnet.g.alchemy.com/v2/UOl6hNcocLE9oB4bbBC9g',
  polygon: 'wss://polygon-mainnet.g.alchemy.com/v2/UOl6hNcocLE9oB4bbBC9g',
  arbitrum: 'wss://arb-mainnet.g.alchemy.com/v2/UOl6hNcocLE9oB4bbBC9g',
};

export const useWeb3Data = () => {
  const {
    updateGasData,
    updateEthPrice,
    connectChain,
    disconnectChain,
    addHistoryPoint,
    mode,
  } = useGasStore();

  const providersRef = useRef<{ [key: string]: ethers.WebSocketProvider }>({});
  const ethPriceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (mode !== 'live') return;

    let isActive = true;

    const connectToChains = async () => {
      for (const [chainId, rpcUrl] of Object.entries(RPC_ENDPOINTS)) {
        console.log(`Connecting to ${chainId} at ${rpcUrl}`);
        try {
          const provider = new ethers.WebSocketProvider(rpcUrl);
          providersRef.current[chainId] = provider;
          connectChain(chainId, provider);

          provider.on('block', async (blockNumber) => {
            if (!isActive) return;

            const block = await provider.getBlock(blockNumber);

            if (block?.baseFeePerGas) {
              const gasData = {
                baseFee: Number(block.baseFeePerGas),
                priorityFee: Number(ethers.parseUnits('2', 'gwei')),
                timestamp: Date.now(),
                blockNumber,
              };

              updateGasData(chainId, gasData);
              console.log(`[${chainId}] Gas data updated:`, gasData);

              const gasGwei = Number(ethers.formatUnits(gasData.baseFee + gasData.priorityFee, 'gwei'));
              addHistoryPoint(chainId, gasGwei);
            }
          });

          provider.on('error', (error: any) => {
            console.error(`${chainId} WebSocket error:`, error);
            disconnectChain(chainId);
          });

        } catch (err) {
          console.error(`Error connecting to ${chainId}:`, err);
        }
      }

      ethPriceIntervalRef.current = setInterval(() => {
        const simulatedPrice = 2000 + Math.random() * 100;
        updateEthPrice(simulatedPrice);
      }, 30000);
    };

    connectToChains();

    return () => {
      isActive = false;

      Object.values(providersRef.current).forEach((provider) => {
        try {
          // Remove all listeners before destroying
          provider.removeAllListeners();
          provider.destroy();
        } catch (err) {
          console.error('Cleanup error:', err);
        }
      });

      if (ethPriceIntervalRef.current) clearInterval(ethPriceIntervalRef.current);
      Object.keys(providersRef.current).forEach((chainId) => disconnectChain(chainId));

      providersRef.current = {};
    };
  }, [mode]);

  useEffect(() => {
    const now = Date.now();

    const chains = ['ethereum', 'polygon', 'arbitrum'];
    const basePrices = { ethereum: 25, polygon: 30, arbitrum: 0.1 };

    chains.forEach((chainId) => {
      const base = basePrices[chainId as keyof typeof basePrices];
      const volatility = (Math.random() - 0.5) * 0.2;
      const price = Math.round((base + base * volatility) * 100) / 100;

      const gasData = {
        baseFee: Number(ethers.parseUnits(price.toString(), 'gwei')),
        priorityFee: Number(ethers.parseUnits('2', 'gwei')),
        timestamp: now,
        blockNumber: Math.floor(Math.random() * 1000000),
      };

      updateGasData(chainId, gasData);
      console.log(`[${chainId}] Gas data updated:`, gasData);

      for (let i = 0; i < 10; i++) {
        const t = now - i * 15 * 60 * 1000;
        const p = Math.round((base + base * (Math.random() - 0.5) * 0.2) * 100) / 100;
        addHistoryPoint(chainId, p);
      }
    });

    updateEthPrice(2000 + Math.random() * 100);
  }, []);
};
