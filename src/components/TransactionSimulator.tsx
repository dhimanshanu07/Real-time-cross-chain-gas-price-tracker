import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGasStore } from '../stores/useGasStore';
import { Calculator, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const TransactionSimulator = () => {
  const { simulation, setSimulation, chains, ethUsdPrice, mode, setMode } = useGasStore();
  const [localAmount, setLocalAmount] = useState(simulation.amount);
  const [localGasLimit, setLocalGasLimit] = useState(simulation.gasLimit.toString());

  const handleSimulate = () => {
    setSimulation({
      amount: localAmount,
      gasLimit: parseInt(localGasLimit)
    });
    setMode('simulation');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatETH = (amount: number) => {
    return `${amount.toFixed(6)} ETH`;
  };

  const getCheapestChain = () => {
    const costs = Object.entries(simulation.costs);
    if (costs.length === 0) return null;
    
    return costs.reduce((cheapest, [chainId, cost]) => {
      return cost.gasCostUSD < cheapest[1].gasCostUSD ? [chainId, cost] : cheapest;
    });
  };

  const getMostExpensiveChain = () => {
    const costs = Object.entries(simulation.costs);
    if (costs.length === 0) return null;
    
    return costs.reduce((expensive, [chainId, cost]) => {
      return cost.gasCostUSD > expensive[1].gasCostUSD ? [chainId, cost] : expensive;
    });
  };

  const cheapest = getCheapestChain();
  const mostExpensive = getMostExpensiveChain();

  return (
    <Card className="p-6 bg-card border-border shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-5 h-5 text-neon-purple" />
        <h2 className="text-xl font-bold text-foreground">Transaction Cost Simulator</h2>
        <Badge 
          variant={mode === 'simulation' ? 'default' : 'secondary'}
          className={mode === 'simulation' ? 'bg-neon-purple/20 text-neon-purple border-neon-purple/30' : ''}
        >
          {mode === 'simulation' ? 'Simulation Active' : 'Live Mode'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulation Inputs */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-foreground">
              Transaction Amount (ETH)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.001"
              min="0"
              value={localAmount}
              onChange={(e) => setLocalAmount(e.target.value)}
              placeholder="0.5"
              className="font-mono bg-secondary/50 border-border/50 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gasLimit" className="text-sm font-medium text-foreground">
              Gas Limit
            </Label>
            <Input
              id="gasLimit"
              type="number"
              min="21000"
              value={localGasLimit}
              onChange={(e) => setLocalGasLimit(e.target.value)}
              placeholder="21000"
              className="font-mono bg-secondary/50 border-border/50 focus:border-primary"
            />
          </div>

          <Button 
            onClick={handleSimulate}
            className="w-full bg-gradient-crypto hover:opacity-90 transition-opacity"
          >
            Calculate Cross-Chain Costs
          </Button>

          {mode === 'simulation' && (
            <Button 
              variant="outline"
              onClick={() => setMode('live')}
              className="w-full border-border/50 hover:border-primary/50"
            >
              Return to Live Mode
            </Button>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">ETH/USD Price:</span>
            <span className="font-mono font-bold text-neon-blue">
              {formatCurrency(ethUsdPrice)}
            </span>
          </div>

          {Object.keys(simulation.costs).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Cross-Chain Comparison
              </h4>
              
              {Object.entries(simulation.costs).map(([chainId, cost]) => {
                const chain = chains[chainId];
                const isCheapest = cheapest && chainId === cheapest[0];
                const isMostExpensive = mostExpensive && chainId === mostExpensive[0];
                
                return (
                  <div 
                    key={chainId}
                    className={`p-4 rounded-lg border transition-all ${
                      isCheapest 
                        ? 'bg-crypto-green/10 border-crypto-green/30' 
                        : isMostExpensive 
                        ? 'bg-crypto-red/10 border-crypto-red/30'
                        : 'bg-secondary/30 border-border/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: chain.color }}
                        />
                        <span className="font-medium text-foreground">{chain.name}</span>
                        {isCheapest && <TrendingDown className="w-4 h-4 text-crypto-green" />}
                        {isMostExpensive && <TrendingUp className="w-4 h-4 text-crypto-red" />}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {isCheapest ? 'Cheapest' : isMostExpensive ? 'Most Expensive' : 'Moderate'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gas Cost:</span>
                        <span className="font-mono">{formatETH(cost.gasCostETH)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gas Cost USD:</span>
                        <span className="font-mono">{formatCurrency(cost.gasCostUSD)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-foreground">Total Cost:</span>
                        <span className="font-mono text-foreground">{formatCurrency(cost.totalCostUSD)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {cheapest && mostExpensive && cheapest[0] !== mostExpensive[0] && (
                <div className="mt-4 p-3 bg-gradient-glow rounded-lg border border-border/30">
                  <div className="flex items-center gap-2 text-sm">
                    <Minus className="w-4 h-4 text-neon-blue" />
                    <span className="text-foreground font-medium">
                      Savings using {chains[cheapest[0]].name}: {' '}
                      {formatCurrency(mostExpensive[1].gasCostUSD - cheapest[1].gasCostUSD)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};