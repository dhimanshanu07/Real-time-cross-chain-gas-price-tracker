import { useEffect } from 'react';
import { useGasStore } from '../stores/useGasStore';

export const useSimulationReactivity = () => {
  useEffect(() => {
    const unsub = useGasStore.subscribe((state, prevState) => {
      if (
        state.mode === 'simulation' &&
        (
          state.ethUsdPrice !== prevState.ethUsdPrice ||
          state.simulation.amount !== prevState.simulation.amount ||
          state.simulation.gasLimit !== prevState.simulation.gasLimit ||
          state.chains !== prevState.chains
        )
      ) {
        useGasStore.getState().calculateSimulationCosts();
      }
    });

    return () => unsub();
  }, []);
};
