'use client'

import { useBugReports } from '@/hooks/use-bug-reports'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bug, AlertCircle } from 'lucide-react'

export default function BugReportsPage() {
  const { data: bugReports, isLoading } = useBugReports()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive'
      case 'in-progress': return 'default'
      case 'resolved': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bug Reports</h1>
        <p className="text-gray-600">View and manage bug reports from failed tests</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : !bugReports || bugReports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bug className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No bug reports yet</p>
            <p className="text-sm text-gray-400 mt-2">Bug reports are generated when tests fail due to product issues</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bugReports.map((bug) => (
            <Card key={bug.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    {bug.title}
                  </CardTitle>
                  <Badge variant={getStatusColor(bug.status)}>
                    {bug.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{bug.actualResult}</p>
                <div className="flex gap-4 mt-3 text-sm text-gray-500">
                  {bug.module && <span>Module: {bug.module}</span>}
                  {bug.environment && <span>Env: {bug.environment}</span>}
                  <span>Created: {new Date(bug.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
