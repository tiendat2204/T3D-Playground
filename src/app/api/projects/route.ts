import { NextResponse } from 'next/server'
import { db } from '@/db'
import { projects } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ data: [], meta: { page: 1, limit: 0, total: 0, totalPages: 0 } })
  }

  try {
    const allProjects = await db.query.projects.findMany({
      orderBy: [desc(projects.createdAt)]
    })
    return NextResponse.json({ data: allProjects })
  } catch (error) {
    console.error('GET /api/projects failed:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { name, baseUrl, description, authConfig } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const project = await db.insert(projects).values({
      id: generateId(),
      name,
      baseUrl,
      description,
      authConfig,
      updatedAt: new Date()
    }).returning()

    return NextResponse.json({ data: project[0] }, { status: 201 })
  } catch (error) {
    console.error('POST /api/projects failed:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
