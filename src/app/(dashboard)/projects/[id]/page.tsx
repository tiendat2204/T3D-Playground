'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useProject, useProjectEnvironments, useCreateEnvironment, useDeleteProject } from '@/hooks/use-projects'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { data: project, isLoading } = useProject(id)
  const { data: environments } = useProjectEnvironments(id)
  const createEnvironment = useCreateEnvironment()
  const deleteProject = useDeleteProject()

  const [openEnvDialog, setOpenEnvDialog] = React.useState(false)
  const [envName, setEnvName] = React.useState('')
  const [envUrl, setEnvUrl] = React.useState('')

  const handleCreateEnvironment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!envName || !envUrl) {
      toast.error('Name and URL are required')
      return
    }
    await createEnvironment.mutateAsync({
      projectId: id,
      data: { name: envName, baseUrl: envUrl }
    })
    toast.success('Environment created')
    setOpenEnvDialog(false)
    setEnvName('')
    setEnvUrl('')
  }

  const handleDelete = async () => {
    await deleteProject.mutateAsync(id)
    toast.success('Project deleted')
    router.push('/projects')
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!project) {
    return <div className="text-center py-8">Project not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-gray-600">{project.baseUrl}</p>
        </div>
        <Button variant="destructive" onClick={handleDelete} disabled={deleteProject.isPending}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Project
        </Button>
      </div>

      {project.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600">{project.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Environments</CardTitle>
          <Dialog open={openEnvDialog} onOpenChange={setOpenEnvDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Environment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateEnvironment}>
                <DialogHeader>
                  <DialogTitle>Add Environment</DialogTitle>
                  <DialogDescription>
                    Add a new environment for this project (e.g., dev, staging, production)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="env-name">Name *</Label>
                    <Input
                      id="env-name"
                      value={envName}
                      onChange={(e) => setEnvName(e.target.value)}
                      placeholder="e.g., Staging"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="env-url">Base URL *</Label>
                    <Input
                      id="env-url"
                      value={envUrl}
                      onChange={(e) => setEnvUrl(e.target.value)}
                      placeholder="https://staging.example.com"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpenEnvDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createEnvironment.isPending}>
                    {createEnvironment.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          {!environments || environments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No environments configured. Click &quot;Add Environment&quot; to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Base URL</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {environments.map((env) => (
                  <TableRow key={env.id}>
                    <TableCell className="font-medium">{env.name}</TableCell>
                    <TableCell>{env.baseUrl}</TableCell>
                    <TableCell>{new Date(env.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
