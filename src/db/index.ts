import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDb() {
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

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const instance = getDb()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (instance as any)[prop]
    if (typeof value === 'function') {
      return value.bind(instance)
    }
    return value
  }
})