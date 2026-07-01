'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsService, type Project, type CreateProjectInput } from '@/services/projects.service'
import { environmentsService, type Environment, type CreateEnvironmentInput } from '@/services/environments.service'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsService.list()
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsService.get(id),
    enabled: !!id
  })
}

export function useProjectEnvironments(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'environments'],
    queryFn: () => environmentsService.list(projectId),
    enabled: !!projectId
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProjectInput) => projectsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProjectInput> }) =>
      projectsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] })
    }
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })
}

export function useCreateEnvironment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: CreateEnvironmentInput }) =>
      environmentsService.create(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId, 'environments'] })
    }
  })
}
