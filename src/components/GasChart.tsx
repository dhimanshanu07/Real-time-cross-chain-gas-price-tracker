import React, { useEffect, useRef, useMemo } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, UTCTimestamp,CandlestickSeries } from 'lightweight-charts';
import { Card } from '@/components/ui/card';
import { useGasStore } from '../stores/gasStore';
import { Activity } from 'lucide-react';

export const GasChart: React.FC = () => {
  const { chains } = useGasStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  // Memoize gas data to prevent unnecessary recalculations
  const { gasData, maxPrice } = useMemo(() => {
    const calculatedData = Object.entries(chains).map(([chainId, chain]) => {
      const gasPrice = chain.gasData
        ? parseFloat(((chain.gasData.baseFee + (chain.gasData.priorityFee || 0)) / 1e9).toFixed(2))
        : Math.random() * 50 + 10;

      return {
        chainId,
        name: chain.name,
        price: gasPrice,
        color: chain.color,
        history: chain.history
      };
    });

    const calculatedMaxPrice = Math.max(...calculatedData.map(d => d.price), 0);

    return { gasData: calculatedData, maxPrice: calculatedMaxPrice };
  }, [chains]);

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: '#1e1e1e' },
        textColor: '#ccc'
      },
      grid: {
        vertLines: { color: '#444' },
        horzLines: { color: '#444' }
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false
      },
      rightPriceScale: {
        borderVisible: false,
      },
      leftPriceScale: {
        visible: true,
        borderVisible: false,
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#4ade80',
      downColor: '#f87171',
      borderUpColor: '#4ade80',
      borderDownColor: '#f87171',
      wickUpColor: '#4ade80',
      wickDownColor: '#f87171'
    });

    seriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Update chart data
  useEffect(() => {
    if (!seriesRef.current) return;

    const allHistory: CandlestickData[] = [];

    gasData.forEach(chain => {
      chain.history.forEach(point => {
        allHistory.push({
          time: (point.time || Date.now() / 1000) as UTCTimestamp,
          open: point.open || 0,
          high: point.high || 0,
          low: point.low || 0,
          close: point.close || 0
        });
      });
    });

    // Sort by time and filter out invalid data points
    const sortedHistory = allHistory
      .filter(point => point.time && !isNaN(point.open) && !isNaN(point.close))
      .sort((a, b) => (a.time as number) - (b.time as number));

    if (sortedHistory.length > 0) {
      seriesRef.current.setData(sortedHistory);
      
      // Auto-scale the time scale to fit data
      chartRef.current?.timeScale().fitContent();
    }
  }, [gasData]);

  return (
    <Card className="p-6 bg-card border-border shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Gas Price Analysis</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="w-4 h-4" />
          Live Data
        </div>
      </div>

      <div className="space-y-4">
        {gasData.map(chain => (
          <div key={chain.chainId} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: chain.color }} 
                />
                <span className="font-medium text-foreground">{chain.name}</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-lg font-bold text-foreground">
                  {chain.price.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground ml-1">gwei</span>
              </div>
            </div>

            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${maxPrice > 0 ? (chain.price / maxPrice) * 100 : 0}%`,
                  backgroundColor: chain.color
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-foreground mb-3">15-Minute Candlestick Chart</h3>
        <div 
          ref={containerRef} 
          className="w-full h-[300px] rounded-lg overflow-hidden"
        />
      </div>
    </Card>
  );
};