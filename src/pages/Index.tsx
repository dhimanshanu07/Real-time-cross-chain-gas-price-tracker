import { Header } from '@/components/Header';
import { GasCard } from '@/components/GasCard';
import { GasChart } from '@/components/GasChart';
import { TransactionSimulator } from '@/components/TransactionSimulator';
import { useGasStore } from '../stores/useGasStore';
import { useWeb3Data } from '@/hooks/useWeb3Data';
import type { NextPage } from 'next';

const IndexPage: NextPage = () => {
  const { chains } = useGasStore();

  useWeb3Data();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="container mx-auto px-6 py-8 space-y-8">
        
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-foreground">Live Gas Prices</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(chains).map(([chainId, chainData]) => (
              <GasCard key={chainId} chainId={chainId} chainData={chainData} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-foreground">Price Volatility Analysis</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent" />
          </div>

          <GasChart />
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-foreground">Cross-Chain Cost Analysis</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent" />
          </div>

          <TransactionSimulator />
        </section>

      </main>
    </div>
  );
};

export default IndexPage;
