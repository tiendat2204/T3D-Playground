'use client'

import { useProjects } from '@/hooks/use-projects'
import { useTestCases } from '@/hooks/use-test-cases'
import { useTestRuns } from '@/hooks/use-test-runs'
import { MetricsCards } from '@/components/dashboard/metrics-cards'

export default function DashboardPage() {
  const { data: projects } = useProjects()
  const { data: testCases } = useTestCases()
  const { data: testRuns } = useTestRuns()

  const totalProjects = projects?.length || 0
  const totalTestCases = testCases?.length || 0

  const completedRuns = testRuns?.filter(r => r.status === 'passed' || r.status === 'failed') || []
  const passedRuns = completedRuns.filter(r => r.status === 'passed')
  const passRate = completedRuns.length > 0 ? Math.round((passedRuns.length / completedRuns.length) * 100) : 0
  const failRate = 100 - passRate

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Overview of your testing platform</p>
      </div>

      <MetricsCards
        totalProjects={totalProjects}
        totalTestCases={totalTestCases}
        passRate={passRate}
        failRate={failRate}
      />
    </div>
  )
}
