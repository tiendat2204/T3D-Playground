import { db } from '../src/db'
import { projects, environments, modules } from '../src/db/schema'

async function seed() {
  console.log('Seeding database...')

  const project = await db.insert(projects).values({
    id: 'proj_demo',
    name: 'Demo Project',
    baseUrl: 'https://example.com',
    description: 'A demo project for testing',
    updatedAt: new Date()
  }).returning()

  await db.insert(environments).values({
    id: 'env_staging',
    projectId: project[0].id,
    name: 'Staging',
    baseUrl: 'https://staging.example.com',
    updatedAt: new Date()
  })

  await db.insert(modules).values({
    id: 'mod_auth',
    projectId: project[0].id,
    name: 'Authentication',
    routePattern: '/auth/*',
    apiPatterns: ['/api/auth/*'],
    updatedAt: new Date()
  })

  console.log('Seed complete!')
}

seed().catch(console.error)