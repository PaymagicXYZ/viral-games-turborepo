'use client';

import useChartData from '@/lib/hooks/useChartData';
import { Market } from '@/lib/types/markets';
import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Address } from 'viem';

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function MarketChart({ market }: { market: Market }) {
  const { chartData } = useChartData({ address: market.id as Address });

  const formattedData = useMemo(
    () =>
      chartData.map(([timestamp, value]) => ({
        timestamp,
        value,
        formattedTime: formatDate(timestamp),
      })),
    [chartData],
  );

  const ticks = useMemo(() => {
    if (formattedData.length < 2) return [];
    const step = Math.floor((formattedData.length - 1) / 4);
    return [0, step, 2 * step, 3 * step, formattedData.length - 1].map(
      (i) => formattedData[i]?.timestamp,
    );
  }, [formattedData]);

  return (
    <div className='h-64 w-full bg-gray-100 p-4'>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart
          data={formattedData}
          margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
        >
          <CartesianGrid
            strokeDasharray='3 3'
            vertical={false}
            stroke='#e0e0e0'
          />
          <XAxis
            dataKey='timestamp'
            type='number'
            domain={['dataMin', 'dataMax']}
            tickFormatter={formatDate}
            ticks={ticks}
            tick={{ fill: '#666', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#666', fontSize: 10 }}
            tickFormatter={(value) => (value === 0 ? '' : `${value}%`)}
            axisLine={false}
            tickLine={false}
            tickCount={6}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '12px',
            }}
            formatter={(value: number) => [`${value.toFixed(2)}%`, 'Yes']}
            labelFormatter={(label) => `Time: ${formatDate(label)}`}
          />
          <Line
            type='basis'
            dataKey='value'
            stroke='#4CAF50'
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
