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
  chains: {
    [chainId: string]: ChainData;
  };
  ethUsdPrice: number;
  simulation: SimulationData;
  
  // Actions
  setMode: (mode: 'live' | 'simulation') => void;
  updateGasData: (chainId: string, gasData: GasData) => void;
  updateEthPrice: (price: number) => void;
  setSimulation: (simulation: Partial<SimulationData>) => void;
  addHistoryPoint: (chainId: string, point: GasPoint) => void;
  connectChain: (chainId: string, provider: ethers.WebSocketProvider) => void;
  disconnectChain: (chainId: string) => void;
  calculateSimulationCosts: () => void;
}

const INITIAL_CHAINS = {
  ethereum: {
    name: 'Ethereum',
    symbol: 'ETH',
    gasData: null,
    history: [],
    provider: null,
    connected: false,
    color: '#627EEA'
  },
  polygon: {
    name: 'Polygon',
    symbol: 'MATIC', 
    gasData: null,
    history: [],
    provider: null,
    connected: false,
    color: '#8247E5'
  },
  arbitrum: {
    name: 'Arbitrum',
    symbol: 'ETH',
    gasData: null,
    history: [],
    provider: null,
    connected: false,
    color: '#28A0F0'
  }
};

export const useGasStore = create<GasStoreState>((set, get) => ({
  mode: 'live',
  chains: INITIAL_CHAINS,
  ethUsdPrice: 0,
  simulation: {
    amount: '0.5',
    gasLimit: 21000,
    costs: {}
  },

  setMode: (mode) => set({ mode }),

  updateGasData: (chainId, gasData) => {
    set((state) => ({
      chains: {
        ...state.chains,
        [chainId]: {
          ...state.chains[chainId],
          gasData
        }
      }
    }));

    // Calculate simulation costs if in simulation mode
    if (get().mode === 'simulation') {
      get().calculateSimulationCosts();
    }
  },

  updateEthPrice: (price) => {
    set({ ethUsdPrice: price });
    
    // Recalculate simulation costs
    if (get().mode === 'simulation') {
      get().calculateSimulationCosts();
    }
  },

  setSimulation: (simulation) => {
    set((state) => ({
      simulation: { ...state.simulation, ...simulation }
    }));
    get().calculateSimulationCosts();
  },

  addHistoryPoint: (chainId, point) => {
    set((state) => ({
      chains: {
        ...state.chains,
        [chainId]: {
          ...state.chains[chainId],
          history: [...state.chains[chainId].history.slice(-99), point] // Keep last 100 points
        }
      }
    }));
  },

  connectChain: (chainId, provider) => {
    set((state) => ({
      chains: {
        ...state.chains,
        [chainId]: {
          ...state.chains[chainId],
          provider,
          connected: true
        }
      }
    }));
  },

  disconnectChain: (chainId) => {
    set((state) => ({
      chains: {
        ...state.chains,
        [chainId]: {
          ...state.chains[chainId],
          provider: null,
          connected: false
        }
      }
    }));
  },

  // Helper method to calculate simulation costs
  calculateSimulationCosts: () => {
    const state = get();
    const { simulation, chains, ethUsdPrice } = state;
    const costs: SimulationData['costs'] = {};

    Object.entries(chains).forEach(([chainId, chain]) => {
      if (chain.gasData) {
        const totalGasFee = chain.gasData.baseFee + chain.gasData.priorityFee;
        const gasCostETH = (totalGasFee * simulation.gasLimit) / 1e18;
        const gasCostUSD = gasCostETH * ethUsdPrice;
        const transactionValueUSD = parseFloat(simulation.amount) * ethUsdPrice;
        const totalCostUSD = gasCostUSD + transactionValueUSD;

        costs[chainId] = {
          gasCostETH,
          gasCostUSD,
          totalCostUSD
        };
      }
    });

    set((state) => ({
      simulation: {
        ...state.simulation,
        costs
      }
    }));
  }
}));