'use client'

import { useState } from 'react'
import { useBugReports, useCreateBugReport } from '@/hooks/use-bug-reports'
import { useProjects } from '@/hooks/use-projects'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Bug, AlertCircle, Plus, Loader2, Filter } from 'lucide-react'
import { toast } from 'sonner'
import type { Project } from '@/services/projects.service'

export default function BugReportsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newBugTitle, setNewBugTitle] = useState('')
  const [newBugProjectId, setNewBugProjectId] = useState('')
  const [newBugModule, setNewBugModule] = useState('')
  const [newBugSteps, setNewBugSteps] = useState('')
  const [newBugExpected, setNewBugExpected] = useState('')
  const [newBugActual, setNewBugActual] = useState('')

  const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined
  const { data: bugReports, isLoading } = useBugReports(filters)
  const createBugReport = useCreateBugReport()
  const { data: projects } = useProjects()

  const projectsList = (projects || []) as Project[]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive'
      case 'in-progress': return 'default'
      case 'resolved': return 'secondary'
      default: return 'outline'
    }
  }

  const handleCreateBugReport = async () => {
    if (!newBugTitle.trim()) {
      toast.error('Title is required')
      return
    }
    if (!newBugProjectId) {
      toast.error('Project is required')
      return
    }

    const steps = newBugSteps.split('\n').filter(s => s.trim())

    try {
      await createBugReport.mutateAsync({
        projectId: newBugProjectId,
        title: newBugTitle.trim(),
        module: newBugModule.trim() || undefined,
        stepsToReproduce: steps.length > 0 ? steps : [''],
        expectedResult: newBugExpected.trim() || '',
        actualResult: newBugActual.trim() || ''
      })

      toast.success('Bug report created')
      setCreateDialogOpen(false)
      setNewBugTitle('')
      setNewBugProjectId('')
      setNewBugModule('')
      setNewBugSteps('')
      setNewBugExpected('')
      setNewBugActual('')
    } catch {
      toast.error('Failed to create bug report')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bug Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage bug reports from failed tests</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Bug Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Bug Report</DialogTitle>
              <DialogDescription>
                Manually create a new bug report
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={newBugTitle}
                  onChange={(e) => setNewBugTitle(e.target.value)}
                  placeholder="Bug title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Project *</label>
                <Select value={newBugProjectId} onValueChange={setNewBugProjectId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectsList.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Module</label>
                <Input
                  value={newBugModule}
                  onChange={(e) => setNewBugModule(e.target.value)}
                  placeholder="Module name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Steps to Reproduce</label>
                <Textarea
                  value={newBugSteps}
                  onChange={(e) => setNewBugSteps(e.target.value)}
                  placeholder="One step per line"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Expected Result</label>
                <Input
                  value={newBugExpected}
                  onChange={(e) => setNewBugExpected(e.target.value)}
                  placeholder="What should happen"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Actual Result</label>
                <Input
                  value={newBugActual}
                  onChange={(e) => setNewBugActual(e.target.value)}
                  placeholder="What actually happened"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBugReport} disabled={createBugReport.isPending || !newBugTitle.trim() || !newBugProjectId}>
                {createBugReport.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium">Status:</span>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        {statusFilter !== 'all' && (
          <Button variant="ghost" size="sm" onClick={() => setStatusFilter('all')}>
            Clear filter
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8 dark:text-gray-300">Loading...</div>
      ) : !bugReports || bugReports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bug className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {statusFilter !== 'all' ? 'No bug reports with this status' : 'No bug reports yet'}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Bug reports are generated when tests fail due to product issues</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">{bug.actualResult}</p>
                <div className="flex gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
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
