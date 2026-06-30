import { NextResponse } from 'next/server'
import { db } from '@/db'
import { projects } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export async function GET() {
  const allProjects = await db.query.projects.findMany({
    orderBy: [desc(projects.createdAt)]
  })
  return NextResponse.json(allProjects)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, baseUrl, description, authConfig } = body

  const project = await db.insert(projects).values({
    id: generateId(),
    name,
    baseUrl,
    description,
    authConfig,
    updatedAt: new Date()
  }).returning()

  return NextResponse.json(project[0], { status: 201 })
}
