'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

interface ProjectCardProps {
  id: string
  name: string
  baseUrl: string
  description?: string
}

export function ProjectCard({ id, name, baseUrl, description }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{name}</CardTitle>
          <Link href={baseUrl} target="_blank">
            <Button variant="ghost" size="icon">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {description || 'No description'}
        </p>
        <p className="text-xs text-gray-500 mb-4">{baseUrl}</p>
        <Link href={`/projects/${id}`}>
          <Button className="w-full">View Project</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
