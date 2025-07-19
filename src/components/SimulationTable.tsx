import React from 'react';
import { useGasStore } from '../stores/useGasStore';

export const SimulationTable: React.FC = () => {
  const { simulation, chains, ethUsdPrice } = useGasStore();

  if (!simulation.costs || Object.keys(simulation.costs).length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        ⚡ Run a simulation to see cross-chain gas costs.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto mt-8">
      <h2 className="text-xl font-bold mb-4 text-foreground">Cross-Chain Transaction Cost Simulation</h2>
      
      <table className="min-w-full bg-background rounded-lg shadow-md border border-border">
        <thead className="bg-secondary text-foreground">
          <tr>
            <th className="px-4 py-3 border">Chain</th>
            <th className="px-4 py-3 border">Symbol</th>
            <th className="px-4 py-3 border">Gas Used</th>
            <th className="px-4 py-3 border">Gas Cost (USD)</th>
            <th className="px-4 py-3 border">Total Cost (USD)</th>
          </tr>
        </thead>

        <tbody className="text-center text-muted-foreground">
          {Object.entries(simulation.costs).map(([chainId, cost]) => {
            const chain = chains[chainId];

            if (!chain) return null; // Defensive check

            const typedCost = cost as { gasCostETH: number; gasCostUSD: number; totalCostUSD: number };
            return (
              <tr key={chainId} className="hover:bg-secondary transition-all">
                <td className="px-4 py-3 border">
                  <div className="flex items-center justify-center gap-2">
                    <div
                      style={{ backgroundColor: chain.color }}
                      className="w-3 h-3 rounded-full"
                    />
                    <span className="text-foreground">{chain.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 border">{chain.symbol}</td>
                <td className="px-4 py-3 border">
                  {typedCost.gasCostETH.toLocaleString(undefined, { minimumFractionDigits: 6 })}
                </td>
                <td className="px-4 py-3 border">
                  ${typedCost.gasCostUSD.toLocaleString(undefined, { minimumFractionDigits: 4 })}
                </td>
                <td className="px-4 py-3 border font-semibold text-foreground">
                  ${typedCost.totalCostUSD.toLocaleString(undefined, { minimumFractionDigits: 4 })}
                </td>
              </tr>
            );
          })}
        </tbody>

        <tfoot>
          <tr className="bg-muted text-foreground">
            <td colSpan={4} className="px-4 py-3 border text-right font-medium">
              ETH/USD Price:
            </td>
            <td className="px-4 py-3 border font-semibold">
              ${ethUsdPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
