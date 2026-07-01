'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useTestRuns } from '@/hooks/use-test-runs'

interface ChartData {
  name: string
  value: number
}

const COLORS = ['#22c55e', '#ef4444', '#a3a3a3']

interface PassFailChartProps {
  data?: ChartData[]
}

export function PassFailChart({ data: externalData }: PassFailChartProps) {
  const { data: testRuns, isLoading } = useTestRuns()

  const chartData = useMemo(() => {
    if (externalData && externalData.length > 0) return externalData

    const runs = (testRuns || []) as { status: string }[]
    const completed = runs.filter(r => r.status === 'passed' || r.status === 'failed')
    const passed = completed.filter(r => r.status === 'passed').length
    const failed = completed.filter(r => r.status === 'failed').length
    const skipped = runs.filter(r => r.status === 'queued' || r.status === 'cancelled').length

    const result: ChartData[] = []
    if (passed > 0) result.push({ name: 'Passed', value: passed })
    if (failed > 0) result.push({ name: 'Failed', value: failed })
    if (skipped > 0) result.push({ name: 'Skipped', value: skipped })
    return result
  }, [testRuns, externalData])

  if (isLoading) {
    return (
      <div className="h-64 bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 p-4">
        <p className="text-gray-500 dark:text-gray-400 text-center">Loading chart...</p>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="h-64 bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 p-4">
        <p className="text-gray-500 dark:text-gray-400 text-center">No test run data available</p>
      </div>
    )
  }

  return (
    <div className="h-64 bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold mb-2">Pass/Fail Distribution</h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          >
            {chartData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--background, #fff)',
              border: '1px solid var(--border, #e5e7eb)',
              borderRadius: '8px'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
