'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProjects } from '@/hooks/use-projects'
import { useProjectEnvironments } from '@/hooks/use-projects'
import { useGenerateTestPlan, useGenerateCode } from '@/hooks/use-ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const wizardSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  environmentId: z.string().min(1, 'Environment is required'),
  url: z.string().url('Must be a valid URL'),
  goal: z.string().min(10, 'Goal must be at least 10 characters'),
  role: z.string().optional(),
  destructiveAllowed: z.boolean().default(false)
})

type WizardFormData = z.infer<typeof wizardSchema>

export function GenerationWizard() {
  const [step, setStep] = useState(0)
  const [generatedPlan, setGeneratedPlan] = useState<unknown>(null)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: { destructiveAllowed: false }
  })

  const selectedProjectId = watch('projectId')
  const { data: projects } = useProjects()
  const { data: environments } = useProjectEnvironments(selectedProjectId)

  const generatePlan = useGenerateTestPlan()
  const generateCode = useGenerateCode()

  const onSubmit = async (data: WizardFormData) => {
    try {
      const result = await generatePlan.mutateAsync(data)
      setGeneratedPlan(result)
      setStep(1)
    } catch (error) {
      toast.error('Failed to generate test plan. Please try again.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">AI Test Generation</h1>

      <Tabs value={`step-${step}`}>
        <TabsList>
          <TabsTrigger value="step-0">1. Configure</TabsTrigger>
          <TabsTrigger value="step-1">2. Review Plan</TabsTrigger>
          <TabsTrigger value="step-2">3. Generate Code</TabsTrigger>
        </TabsList>

        <TabsContent value="step-0">
          <Card>
            <CardHeader>
              <CardTitle>Test Generation Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectId">Project</Label>
                  <select
                    id="projectId"
                    {...register('projectId')}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="">Select a project</option>
                    {projects?.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.projectId && (
                    <p className="text-sm text-red-500">{errors.projectId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="environmentId">Environment</Label>
                  <select
                    id="environmentId"
                    {...register('environmentId')}
                    className="w-full border rounded-md p-2"
                    disabled={!selectedProjectId}
                  >
                    <option value="">Select an environment</option>
                    {environments?.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                  {errors.environmentId && (
                    <p className="text-sm text-red-500">{errors.environmentId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">Target URL</Label>
                  <Input id="url" {...register('url')} placeholder="https://example.com/admin" />
                  {errors.url && (
                    <p className="text-sm text-red-500">{errors.url.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Testing Goal</Label>
                  <Textarea
                    id="goal"
                    {...register('goal')}
                    placeholder="Test login, create product, edit product, delete product"
                  />
                  {errors.goal && (
                    <p className="text-sm text-red-500">{errors.goal.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">User Role (optional)</Label>
                  <Input id="role" {...register('role')} placeholder="Admin" />
                </div>

                <Button type="submit" disabled={generatePlan.isPending}>
                  {generatePlan.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Plan...
                    </>
                  ) : (
                    'Generate Test Plan'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="step-1">
          <Card>
            <CardHeader>
              <CardTitle>Generated Test Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                {JSON.stringify(generatedPlan, null, 2)}
              </pre>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => setStep(0)}>Back</Button>
                <Button onClick={() => setStep(2)}>Continue to Code Generation</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="step-2">
          <Card>
            <CardHeader>
              <CardTitle>Generated Code</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Code generation will appear here</p>
              <div className="mt-4">
                <Button onClick={() => setStep(1)}>Back</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
