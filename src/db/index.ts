import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

let _db: NodePgDatabase<typeof schema> | null = null

export function getDb(): NodePgDatabase<typeof schema> {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured')
    }
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    })
    _db = drizzle(pool, { schema })
  }
  return _db
}

// Lazy proxy that defers connection until first use
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop) {
    const instance = getDb()
    const value = (instance as Record<string | symbol, unknown>)[prop]
    if (typeof value === 'function') {
      return value.bind(instance)
    }
    return value
  }
})