import { NextResponse } from 'next/server'
import { db } from '@/db'
import { environments } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ data: [], meta: { page: 1, limit: 0, total: 0, totalPages: 0 } })
  }

  try {
    const { id } = await params
    const projectEnvironments = await db.query.environments.findMany({
      where: eq(environments.projectId, id)
    })
    return NextResponse.json({ data: projectEnvironments })
  } catch (error) {
    console.error('GET /api/projects/[id]/environments failed:', error)
    return NextResponse.json({ error: 'Failed to fetch environments' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { name, baseUrl, variables } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const environment = await db.insert(environments).values({
      id: generateId(),
      projectId: id,
      name,
      baseUrl,
      variables,
      updatedAt: new Date()
    }).returning()

    return NextResponse.json({ data: environment[0] }, { status: 201 })
  } catch (error) {
    console.error('POST /api/projects/[id]/environments failed:', error)
    return NextResponse.json({ error: 'Failed to create environment' }, { status: 500 })
  }
}
