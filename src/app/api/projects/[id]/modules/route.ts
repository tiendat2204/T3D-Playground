import { NextResponse } from 'next/server'
import { db } from '@/db'
import { modules } from '@/db/schema'
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
    const projectModules = await db.query.modules.findMany({
      where: eq(modules.projectId, id)
    })
    return NextResponse.json({ data: projectModules })
  } catch (error) {
    console.error('GET /api/projects/[id]/modules failed:', error)
    return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
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
    const { name, routePattern, apiPatterns } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const module = await db.insert(modules).values({
      id: generateId(),
      projectId: id,
      name,
      routePattern,
      apiPatterns,
      updatedAt: new Date()
    }).returning()

    return NextResponse.json({ data: module[0] }, { status: 201 })
  } catch (error) {
    console.error('POST /api/projects/[id]/modules failed:', error)
    return NextResponse.json({ error: 'Failed to create module' }, { status: 500 })
  }
}
