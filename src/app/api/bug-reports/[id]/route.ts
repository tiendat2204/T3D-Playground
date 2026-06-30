import { NextResponse } from 'next/server'
import { db } from '@/db'
import { bugReports } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const bugReport = await db.query.bugReports.findFirst({
    where: eq(bugReports.id, id)
  })

  if (!bugReport) {
    return NextResponse.json({ error: 'Bug report not found' }, { status: 404 })
  }

  return NextResponse.json(bugReport)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const updated = await db.update(bugReports).set({
    ...body,
    updatedAt: new Date()
  }).where(eq(bugReports.id, id)).returning()

  if (updated.length === 0) {
    return NextResponse.json({ error: 'Bug report not found' }, { status: 404 })
  }

  return NextResponse.json(updated[0])
}
