import { NextResponse } from 'next/server'
import { db } from '@/db'
import { environments } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const projectEnvironments = await db.query.environments.findMany({
    where: eq(environments.projectId, id)
  })
  return NextResponse.json(projectEnvironments)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { name, baseUrl, variables } = body

  const environment = await db.insert(environments).values({
    id: generateId(),
    projectId: id,
    name,
    baseUrl,
    variables,
    updatedAt: new Date()
  }).returning()

  return NextResponse.json(environment[0], { status: 201 })
}
