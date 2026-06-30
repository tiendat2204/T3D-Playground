import { NextResponse } from 'next/server'
import { db } from '@/db'
import { modules } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const projectModules = await db.query.modules.findMany({
    where: eq(modules.projectId, id)
  })
  return NextResponse.json(projectModules)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { name, routePattern, apiPatterns } = body

  const module = await db.insert(modules).values({
    id: generateId(),
    projectId: id,
    name,
    routePattern,
    apiPatterns,
    updatedAt: new Date()
  }).returning()

  return NextResponse.json(module[0], { status: 201 })
}
