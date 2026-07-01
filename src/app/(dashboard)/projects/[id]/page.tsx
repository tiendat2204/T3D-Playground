'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useProject, useProjectEnvironments } from '@/hooks/use-projects'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink } from 'lucide-react'

export default function ProjectDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { data: project, isLoading } = useProject(id)
  const { data: environments } = useProjectEnvironments(id)

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!project) {
    return <div className="text-center py-8">Project not found</div>
  }

  const projectData = project as { id: string; name: string; baseUrl: string; description?: string }
  const environmentsList = environments as { id: string; name: string; baseUrl: string }[] | undefined

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{projectData.name}</h1>
          <p className="text-gray-600">{projectData.baseUrl}</p>
        </div>
        <Link href={projectData.baseUrl} target="_blank">
          <Button variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            Visit Site
          </Button>
        </Link>
      </div>

      {projectData.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600">{projectData.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Environments</CardTitle>
        </CardHeader>
        <CardContent>
          {environmentsList?.length === 0 ? (
            <p className="text-gray-500">No environments configured</p>
          ) : (
            <div className="space-y-2">
              {environmentsList?.map(env => (
                <div key={env.id} className="flex items-center justify-between p-2 border rounded">
                  <span>{env.name}</span>
                  <span className="text-sm text-gray-500">{env.baseUrl}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
