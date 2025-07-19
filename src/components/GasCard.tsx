import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ethers } from 'ethers';
import { ChainData } from '../stores/useGasStore';

interface GasCardProps {
  chainId: string;
  chainData: ChainData;
}

export const GasCard = ({ chainId, chainData }: GasCardProps) => {
  const { name, symbol, gasData, connected, color } = chainData;

  const formatGasPrice = (wei: number) => {
    return parseFloat(ethers.formatUnits(wei, 'gwei')).toFixed(2);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Card className="p-6 bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-full animate-pulse-neon"
            style={{ backgroundColor: color }}
          />
          <h3 className="text-lg font-bold text-foreground">{name}</h3>
          <Badge 
            variant={connected ? "default" : "secondary"} 
            className={connected ? "bg-crypto-green/20 text-crypto-green border-crypto-green/30" : ""}
          >
            {connected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
        <span className="text-sm text-muted-foreground font-mono">{symbol}</span>
      </div>

      {gasData ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Base Fee</p>
              <p className="text-xl font-mono font-bold text-neon-blue group-hover:text-primary transition-colors">
                {formatGasPrice(gasData.baseFee)} <span className="text-sm text-muted-foreground">gwei</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Priority Fee</p>
              <p className="text-xl font-mono font-bold text-neon-purple group-hover:text-accent transition-colors">
                {formatGasPrice(gasData.priorityFee)} <span className="text-sm text-muted-foreground">gwei</span>
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-border/30">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Total Gas Price</span>
              <span className="text-lg font-mono font-bold text-foreground">
                {formatGasPrice(gasData.baseFee + gasData.priorityFee)} gwei
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-muted-foreground">Block #{gasData.blockNumber}</span>
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(gasData.timestamp)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-24">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 bg-muted rounded-full animate-pulse" />
            <span className="text-sm">Waiting for data...</span>
          </div>
        </div>
      )}
    </Card>
  );
};