'use client'

import { useRouter } from 'next/navigation'
import { useCreateProject } from '@/hooks/use-projects'
import { ProjectForm } from '@/components/projects/project-form'

export default function NewProjectPage() {
  const router = useRouter()
  const createProject = useCreateProject()

  const handleSubmit = async (data: unknown) => {
    await createProject.mutateAsync(data)
    router.push('/projects')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Project</h1>
      <ProjectForm onSubmit={handleSubmit} isLoading={createProject.isPending} />
    </div>
  )
}
