'use client'

import Link from 'next/link'
import { useTestRuns } from '@/hooks/use-test-runs'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, Play } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface TestRunItem {
  id: string
  status: string
  runType: string
  createdAt: string
  summary?: {
    total: number
    passed: number
    failed: number
  }
}

export function RecentRuns() {
  const { data: testRuns, isLoading } = useTestRuns()

  const runs = (testRuns || []).slice(0, 5) as TestRunItem[]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />
      case 'running': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'passed': return 'default' as const
      case 'failed': return 'destructive' as const
      case 'running': return 'secondary' as const
      default: return 'outline' as const
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 p-4">
        <p className="text-gray-500 dark:text-gray-400 text-center">Loading...</p>
      </div>
    )
  }

  if (runs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 p-4">
        <p className="text-gray-500 dark:text-gray-400 text-center">No recent runs</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700">
      <div className="p-4 border-b dark:border-gray-700">
        <h3 className="font-semibold">Recent Runs</h3>
      </div>
      <div className="divide-y dark:divide-gray-700">
        {runs.map((run) => (
          <Link
            key={run.id}
            href={`/test-runs/${run.id}`}
            className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {getStatusIcon(run.status)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">Test Run</span>
                <Badge variant={getStatusVariant(run.status)} className="text-xs">
                  {run.status}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {run.runType} &middot; {formatDate(run.createdAt)}
              </p>
            </div>
            {run.summary && (
              <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                <span className="text-green-600 dark:text-green-400">{run.summary.passed}</span>
                /
                <span className="text-red-600 dark:text-red-400">{run.summary.failed}</span>
                /
                <span>{run.summary.total}</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
