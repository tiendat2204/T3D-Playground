import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL

let _queue: Queue | null = null

function getQueue(): Queue | null {
  if (!REDIS_URL) return null
  if (!_queue) {
    _queue = new Queue('test-runs', {
      connection: new IORedis(REDIS_URL, { maxRetriesPerRequest: null }) as any
    })
  }
  return _queue
}

export const testRunQueue = {
  add: async (name: string, data: unknown) => {
    const queue = getQueue()
    if (!queue) {
      console.warn('Redis not configured, skipping job queue')
      return null
    }
    return queue.add(name, data)
  }
}

export function createTestRunWorker(processor: (jobData: unknown) => Promise<void>) {
  if (!REDIS_URL) {
    console.warn('Redis not configured, worker not started')
    return null
  }
  return new Worker('test-runs', async job => {
    await processor(job.data)
  }, {
    connection: new IORedis(REDIS_URL, { maxRetriesPerRequest: null }) as any
  })
}
