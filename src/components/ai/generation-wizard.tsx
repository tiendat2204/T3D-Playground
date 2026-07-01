'use client'

import * as React from 'react'
import { useProjects, useProjectEnvironments } from '@/hooks/use-projects'
import { aiService, type TestPlan } from '@/services/ai.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Sparkles, ArrowLeft, ArrowRight, Check, Copy, Download, Code } from 'lucide-react'
import { toast } from 'sonner'
import { CodeBlock } from '@/components/ui/code-block'

export function GenerationWizard() {
  const [step, setStep] = React.useState(0)
  const [projectId, setProjectId] = React.useState('')
  const [environmentId, setEnvironmentId] = React.useState('')
  const [url, setUrl] = React.useState('')
  const [goal, setGoal] = React.useState('')
  const [role, setRole] = React.useState('')
  const [testPlan, setTestPlan] = React.useState<TestPlan | null>(null)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [selectedCaseIndex, setSelectedCaseIndex] = React.useState<number | null>(null)
  const [generatedCode, setGeneratedCode] = React.useState<string | null>(null)
  const [isGeneratingCode, setIsGeneratingCode] = React.useState(false)

  const { data: projects } = useProjects()
  const { data: environments } = useProjectEnvironments(projectId)

  const projectsList = (projects || []) as { id: string; name: string; baseUrl: string }[]
  const environmentsList = (environments || []) as { id: string; name: string; baseUrl: string }[]

  const allCases = React.useMemo(() => {
    if (!testPlan) return []
    const cases: { title: string; steps: string[]; expectedResult: string; suite: string; tags: string[] }[] = []
    testPlan.testSuites.forEach(suite => {
      suite.cases.forEach(c => {
        cases.push({ ...c, suite: suite.name, tags: [...suite.tags, ...c.tags] })
      })
    })
    return cases
  }, [testPlan])

  const handleGeneratePlan = async () => {
    if (!projectId || !url || !goal) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsGenerating(true)
    try {
      const result = await aiService.generatePlan({ projectId, url, goal, role: role || undefined })
      if (result) {
        setTestPlan(result)
        setStep(1)
        toast.success('Test plan generated!')
      } else {
        toast.error('Failed to generate test plan')
      }
    } catch {
      toast.error('Failed to generate test plan')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateCode = async (caseIndex: number) => {
    if (!environmentId) {
      toast.error('Please select an environment first')
      return
    }

    setSelectedCaseIndex(caseIndex)
    setIsGeneratingCode(true)
    setGeneratedCode(null)

    try {
      const testCase = allCases[caseIndex]
      const result = await aiService.generateCode({
        title: testCase.title,
        steps: testCase.steps,
        expectedResult: testCase.expectedResult,
        baseUrl: url,
        environmentId
      })

      if (result) {
        setGeneratedCode(result)
        toast.success('Code generated!')
      } else {
        toast.error('Failed to generate code')
      }
    } catch {
      toast.error('Failed to generate code')
    } finally {
      setIsGeneratingCode(false)
    }
  }

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode)
      toast.success('Code copied to clipboard!')
    }
  }

  const handleDownloadCode = () => {
    if (generatedCode) {
      const blob = new Blob([generatedCode], { type: 'text/typescript' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `test-${Date.now()}.spec.ts`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Code downloaded!')
    }
  }

  const handleProjectChange = (value: string) => {
    setProjectId(value)
    setEnvironmentId('')
    const project = projectsList.find(p => p.id === value)
    if (project) setUrl(project.baseUrl)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">AI Test Generation</h1>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 text-sm">
        {['Configure', 'Review Plan', 'Generate Code'].map((label, i) => (
          <React.Fragment key={label}>
            {i > 0 && <div className="flex-1 h-px bg-gray-200" />}
            <div className={`flex items-center gap-1 ${step >= i ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= i ? 'bg-primary text-primary-foreground' : 'bg-gray-200'}`}>
                {step > i ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span>{label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Step 0: Configure */}
      {step === 0 && (
        <Card>
          <CardHeader><CardTitle>Test Generation Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Project *</Label>
              <Select value={projectId} onValueChange={handleProjectChange}>
                <SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger>
                <SelectContent>
                  {projectsList.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Environment *</Label>
              <Select value={environmentId} onValueChange={setEnvironmentId} disabled={!projectId}>
                <SelectTrigger><SelectValue placeholder="Select an environment" /></SelectTrigger>
                <SelectContent>
                  {environmentsList.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target URL *</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" />
            </div>
            <div className="space-y-2">
              <Label>Testing Goal *</Label>
              <Textarea value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Test login, create product, edit product, delete product" rows={3} />
            </div>
            <div className="space-y-2">
              <Label>User Role</Label>
              <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g., Admin, User" />
            </div>
            <Button onClick={handleGeneratePlan} disabled={isGenerating || !projectId || !url || !goal}>
              {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate Test Plan</>}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Review Plan */}
      {step === 1 && testPlan && (
        <Card>
          <CardHeader><CardTitle>Generated Test Plan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-none"><p className="text-sm text-gray-600">{testPlan.summary}</p></div>
            <div className="space-y-4">
              {testPlan.testSuites.map((suite, i) => (
                <div key={i} className="border rounded-none p-4">
                  <h3 className="font-semibold mb-2">{suite.name}</h3>
                  <div className="flex gap-2 mb-3">
                    <span className={`px-2 py-1 text-xs rounded-none ${suite.priority === 'high' ? 'bg-red-100 text-red-700' : suite.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{suite.priority}</span>
                    {suite.tags.map(tag => <span key={tag} className="px-2 py-1 text-xs bg-gray-100 rounded-none">{tag}</span>)}
                  </div>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {suite.cases.map((c, j) => <li key={j}>{c.title}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(0)}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
              <Button onClick={() => setStep(2)}>Continue to Code Generation<ArrowRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Code Generation */}
      {step === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Select Test Case to Generate Code</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allCases.map((tc, i) => (
                  <div key={i} className={`p-3 border rounded-none cursor-pointer transition-colors ${selectedCaseIndex === i ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`} onClick={() => setSelectedCaseIndex(i)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{tc.title}</p>
                        <p className="text-xs text-gray-500">{tc.suite}</p>
                      </div>
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); handleGenerateCode(i) }} disabled={isGeneratingCode}>
                        {isGeneratingCode && selectedCaseIndex === i ? <Loader2 className="w-4 h-4 animate-spin" /> : <Code className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {generatedCode && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Generated Playwright Code</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyCode}><Copy className="w-4 h-4 mr-1" />Copy</Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadCode}><Download className="w-4 h-4 mr-1" />Download</Button>
                </div>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  code={generatedCode}
                  language="typescript"
                  filename="test.spec.ts"
                  showLineNumbers
                />
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
          </div>
        </div>
      )}
    </div>
  )
}
