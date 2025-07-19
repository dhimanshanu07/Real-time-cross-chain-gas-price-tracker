import { create } from 'zustand';
import { ethers } from 'ethers';

export interface GasData {
  baseFee: number;
  priorityFee: number;
  timestamp: number;
  blockNumber: number;
}

export interface GasPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface ChainData {
  name: string;
  symbol: string;
  gasData: GasData | null;
  history: GasPoint[];
  provider: ethers.WebSocketProvider | null;
  connected: boolean;
  color: string;
}

export interface SimulationData {
  amount: string;
  gasLimit: number;
  costs: {
    [chainId: string]: {
      gasCostETH: number;
      gasCostUSD: number;
      totalCostUSD: number;
    };
  };
}

export interface GasStoreState {
  mode: 'live' | 'simulation';
  chains: { [chainId: string]: ChainData };
  ethUsdPrice: number;
  simulation: SimulationData;

  setMode: (mode: 'live' | 'simulation') => void;
  updateGasData: (chainId: string, gasData: GasData) => void;
  updateEthPrice: (price: number) => void;
  setSimulation: (simulation: Partial<SimulationData>) => void;
  addHistoryPoint: (chainId: string, newPrice: number) => void;
  connectChain: (chainId: string, provider: ethers.WebSocketProvider) => void;
  disconnectChain: (chainId: string) => void;
  calculateSimulationCosts: () => void;
}

const INITIAL_CHAINS: { [key: string]: ChainData } = {
  ethereum: {
    name: 'Ethereum',
    symbol: 'ETH',
    gasData: null,
    history: [],
    provider: null,
    connected: false,
    color: '#627EEA',
  },
  polygon: {
    name: 'Polygon',
    symbol: 'MATIC',
    gasData: null,
    history: [],
    provider: null,
    connected: false,
    color: '#8247E5',
  },
  arbitrum: {
    name: 'Arbitrum',
    symbol: 'ETH',
    gasData: null,
    history: [],
    provider: null,
    connected: false,
    color: '#28A0F0',
  },
};

export const useGasStore = create<GasStoreState>((set, get) => ({
  mode: 'live',
  chains: INITIAL_CHAINS,
  ethUsdPrice: 0,
  simulation: {
    amount: '0.5',
    gasLimit: 21000,
    costs: {},
  },

  setMode: (mode) => set({ mode }),

  updateGasData: (chainId, gasData) => {
    set((state) => {
      const chain = state.chains[chainId];
      if (!chain) return state; // Defensive check

      return {
        chains: {
          ...state.chains,
          [chainId]: {
            ...chain,
            gasData,
          },
        },
      };
    });

    const totalGas = gasData.baseFee + gasData.priorityFee;
    const totalGasGwei = Number(ethers.formatUnits(totalGas, 'gwei'));
    get().addHistoryPoint(chainId, totalGasGwei);
  },

  updateEthPrice: (price) => {
    set({ ethUsdPrice: price });
  },

  setSimulation: (simulation) => {
    set((state) => ({
      simulation: { ...state.simulation, ...simulation },
    }));
  },

  addHistoryPoint: (chainId, newPrice) => {
    set((state) => {
      const chain = state.chains[chainId];
      if (!chain) return state; // Defensive check

      const now = Math.floor(Date.now() / 1000);
      const lastPoint = chain.history[chain.history.length - 1];
      const lastTime = lastPoint ? lastPoint.time : now - 1;

      let updatedHistory: GasPoint[] = [];

      for (let t = lastTime + 1; t <= now; t++) {
        updatedHistory.push({
          time: t,
          open: newPrice,
          high: newPrice,
          low: newPrice,
          close: newPrice
        });
      }

      return {
        chains: {
          ...state.chains,
          [chainId]: {
            ...chain,
            history: [...chain.history, ...updatedHistory].slice(-100),
          },
        },
      };
    });
  },

  connectChain: (chainId, provider) => {
    set((state) => ({
      chains: {
        ...state.chains,
        [chainId]: {
          ...state.chains[chainId],
          provider,
          connected: true,
        },
      },
    }));
  },

  disconnectChain: (chainId) => {
    set((state) => ({
      chains: {
        ...state.chains,
        [chainId]: {
          ...state.chains[chainId],
          provider: null,
          connected: false,
        },
      },
    }));
  },

  calculateSimulationCosts: () => {
    const { simulation, chains, ethUsdPrice } = get();
    const costs: SimulationData['costs'] = {};

    Object.entries(chains).forEach(([chainId, chain]) => {
      if (!chain.gasData) return;

      let totalGasETH: number;

      if (chainId === 'arbitrum') {
        totalGasETH = (chain.gasData.baseFee * simulation.gasLimit) / 1e9;
      } else {
        const totalGasFee = chain.gasData.baseFee + chain.gasData.priorityFee;
        totalGasETH = (totalGasFee * simulation.gasLimit) / 1e9;
      }

      const gasCostUSD = totalGasETH * ethUsdPrice;
      const transactionValueUSD = parseFloat(simulation.amount) * ethUsdPrice;
      const totalCostUSD = gasCostUSD + transactionValueUSD;

      costs[chainId] = {
        gasCostETH: totalGasETH,
        gasCostUSD,
        totalCostUSD,
      };
    });

    set((state) => ({
      simulation: {
        ...state.simulation,
        costs,
      },
    }));
  },
}));
