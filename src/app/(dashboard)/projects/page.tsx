'use client'

import Link from 'next/link'
import { useProjects } from '@/hooks/use-projects'
import { ProjectCard } from '@/components/projects/project-card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects()
  const projectsList = projects as { id: string; name: string; baseUrl: string; description?: string }[] | undefined

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-gray-600">Manage your testing projects</p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : projectsList?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">No projects yet</p>
          <Link href="/projects/new">
            <Button className="mt-4">Create your first project</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projectsList?.map(project => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              baseUrl={project.baseUrl}
              description={project.description || undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
