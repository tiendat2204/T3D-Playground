'use client'

import { useProjects } from '@/hooks/use-projects'
import { useTestCases } from '@/hooks/use-test-cases'
import { useTestRuns } from '@/hooks/use-test-runs'
import { MetricsCards } from '@/components/dashboard/metrics-cards'

export default function DashboardPage() {
  const { data: projects } = useProjects()
  const { data: testCases } = useTestCases()
  const { data: testRuns } = useTestRuns()

  const projectsList = projects as { id: string; name: string }[] | undefined
  const testCasesList = testCases as { id: string; title: string }[] | undefined
  const testRunsList = testRuns as { id: string; status: string }[] | undefined

  const totalProjects = projectsList?.length || 0
  const totalTestCases = testCasesList?.length || 0

  const completedRuns = testRunsList?.filter(r => r.status === 'passed' || r.status === 'failed') || []
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
