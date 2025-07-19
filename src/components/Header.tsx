import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGasStore } from '../stores/useGasStore';
import { Activity, BarChart3, Zap } from 'lucide-react';

export const Header = () => {
  const { mode, setMode, ethUsdPrice } = useGasStore();

  return (
    <header className="border-b border-border bg-card backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Zap className="w-8 h-8 text-neon-purple" />
                <div className="absolute inset-0 bg-neon-purple/20 blur-lg rounded-full" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-crypto bg-clip-text text-transparent">
                  Chain Cost Vision
                </h1>
                <p className="text-sm text-muted-foreground">
                  Real-time cross-chain gas price tracker
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* ETH Price Display */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg border border-border/30">
              <BarChart3 className="w-4 h-4 text-neon-blue" />
              <span className="text-sm text-muted-foreground">ETH/USD:</span>
              <span className="font-mono font-bold text-neon-blue">
                ${ethUsdPrice.toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
            </div>

            {/* Mode Indicators */}
            <div className="flex items-center gap-2">
              <Button
                variant={mode === 'live' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('live')}
                className={mode === 'live' 
                  ? 'bg-crypto-green hover:bg-crypto-green/90 text-white' 
                  : 'border-border/50 hover:border-crypto-green/50'
                }
              >
                <Activity className="w-4 h-4 mr-2" />
                Live
              </Button>
              <Button
                variant={mode === 'simulation' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('simulation')}
                className={mode === 'simulation'
                  ? 'bg-neon-purple hover:bg-neon-purple/90 text-white'
                  : 'border-border/50 hover:border-neon-purple/50'
                }
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Simulate
              </Button>
            </div>

            {/* Status Badge */}
            <Badge 
              variant={mode === 'live' ? 'default' : 'secondary'}
              className={`animate-pulse-neon ${
                mode === 'live' 
                  ? 'bg-crypto-green/20 text-crypto-green border-crypto-green/30' 
                  : 'bg-neon-purple/20 text-neon-purple border-neon-purple/30'
              }`}
            >
              {mode === 'live' ? '● Live Data' : '● Simulation'}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
};