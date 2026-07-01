'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTestCases } from '@/hooks/use-test-cases'
import { useProjects } from '@/hooks/use-projects'
import { useCreateTestRun } from '@/hooks/use-test-runs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { TestTube, Plus, Play, Loader2, Filter } from 'lucide-react'
import { toast } from 'sonner'
import type { TestCase } from '@/services/test-cases.service'
import type { Project } from '@/services/projects.service'

export default function TestCasesPage() {
  const { data: testCases, isLoading } = useTestCases()
  const { data: projects } = useProjects()
  const createTestRun = useCreateTestRun()
  const router = useRouter()

  const [tagFilter, setTagFilter] = useState<string>('all')
  const [runDialogOpen, setRunDialogOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [selectedEnvId, setSelectedEnvId] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const projectsList = (projects || []) as Project[]
  const projectMap = useMemo(() => {
    const map = new Map<string, string>()
    projectsList.forEach((p) => map.set(p.id, p.name))
    return map
  }, [projectsList])

  const getProjectName = (projectId: string) => projectMap.get(projectId) || projectId

  const allTags = useMemo(() => {
    if (!testCases) return []
    const tagSet = new Set<string>()
    testCases.forEach((tc: TestCase) => {
      tc.tags?.forEach((tag: string) => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [testCases])

  const filteredTestCases = useMemo(() => {
    if (!testCases) return []
    if (tagFilter === 'all') return testCases
    return testCases.filter((tc: TestCase) => tc.tags?.includes(tagFilter))
  }, [testCases, tagFilter])

  const handleRunSingleTest = async (testCase: TestCase) => {
    if (!testCase.projectId) {
      toast.error('Test case has no project associated')
      return
    }

    try {
      const result = await createTestRun.mutateAsync({
        projectId: testCase.projectId,
        environmentId: 'default',
        runType: 'manual',
        testCaseIds: [testCase.id]
      })

      if (result) {
        toast.success('Test run created')
        router.push(`/test-runs/${result.id}`)
      }
    } catch {
      toast.error('Failed to create test run')
    }
  }

  const handleRunByTags = async () => {
    if (!selectedProjectId) {
      toast.error('Please select a project')
      return
    }

    try {
      const result = await createTestRun.mutateAsync({
        projectId: selectedProjectId,
        environmentId: selectedEnvId || 'default',
        runType: 'manual',
        tags: selectedTags.length > 0 ? selectedTags : undefined
      })

      if (result) {
        toast.success('Test run created')
        setRunDialogOpen(false)
        setSelectedTags([])
        router.push(`/test-runs/${result.id}`)
      }
    } catch {
      toast.error('Failed to create test run')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Test Cases</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your test cases</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={runDialogOpen} onOpenChange={setRunDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Play className="w-4 h-4 mr-2" />
                Run by Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Run Tests by Tag</DialogTitle>
                <DialogDescription>
                  Select a project and tags to run specific test cases
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project</label>
                  <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
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
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedTags(prev =>
                            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                          )
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {allTags.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No tags available</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRunDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRunByTags} disabled={createTestRun.isPending || !selectedProjectId}>
                  {createTestRun.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Run Tests
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Link href="/ai-generate">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Generate Test Case
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium">Filter by tag:</span>
        </div>
        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {allTags.map((tag) => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {tagFilter !== 'all' && (
          <Button variant="ghost" size="sm" onClick={() => setTagFilter('all')}>
            Clear filter
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8 dark:text-gray-300">Loading...</div>
      ) : !filteredTestCases || filteredTestCases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TestTube className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {tagFilter !== 'all' ? 'No test cases with this tag' : 'No test cases yet'}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Use AI Generate to create your first test case</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTestCases.map((tc: TestCase) => (
            <Card key={tc.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{tc.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={tc.status === 'approved' ? 'default' : tc.status === 'draft' ? 'secondary' : 'outline'}>
                      {tc.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRunSingleTest(tc)}
                      disabled={createTestRun.isPending}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Run
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">{tc.description || 'No description'}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Project: {getProjectName(tc.projectId)}
                  </span>
                  <div className="flex gap-2 ml-auto">
                    {tc.tags?.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
