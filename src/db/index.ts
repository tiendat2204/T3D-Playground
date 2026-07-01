import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

type DbInstance = NodePgDatabase<typeof schema>

let _db: DbInstance | null = null

function createDb(): DbInstance {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured')
  }
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })
  return drizzle(pool, { schema })
}

export function getDb(): DbInstance {
  if (!_db) {
    _db = createDb()
  }
  return _db
}

// Export db as a getter function that lazily creates the connection
export const db = {
  get query() {
    return getDb().query
  },
  get select() {
    return getDb().select.bind(getDb())
  },
  get insert() {
    return getDb().insert.bind(getDb())
  },
  get update() {
    return getDb().update.bind(getDb())
  },
  get delete() {
    return getDb().delete.bind(getDb())
  }
}