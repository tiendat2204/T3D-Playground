'use client'

import { FolderKanban, TestTube, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MetricsCardsProps {
  totalProjects: number
  totalTestCases: number
  passRate: number
  failRate: number
}

export function MetricsCards({ totalProjects, totalTestCases, passRate, failRate }: MetricsCardsProps) {
  const metrics = [
    {
      title: 'Total Projects',
      value: totalProjects,
      icon: FolderKanban,
      color: 'text-blue-600'
    },
    {
      title: 'Test Cases',
      value: totalTestCases,
      icon: TestTube,
      color: 'text-purple-600'
    },
    {
      title: 'Pass Rate',
      value: `${passRate}%`,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Fail Rate',
      value: `${failRate}%`,
      icon: XCircle,
      color: 'text-red-600'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {metric.title}
            </CardTitle>
            <metric.icon className={`w-5 h-5 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
