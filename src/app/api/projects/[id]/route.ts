import { NextResponse } from 'next/server'
import { db } from '@/db'
import { projects } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  try {
    const { id } = await params
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id)
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ data: project })
  } catch (error) {
    console.error('GET /api/projects/[id] failed:', error)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    const updated = await db.update(projects).set({
      ...body,
      updatedAt: new Date()
    }).where(eq(projects.id, id)).returning()

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ data: updated[0] })
  } catch (error) {
    console.error('PUT /api/projects/[id] failed:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  try {
    const { id } = await params
    const deleted = await db.delete(projects).where(eq(projects.id, id)).returning()

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    console.error('DELETE /api/projects/[id] failed:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
