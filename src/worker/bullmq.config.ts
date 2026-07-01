import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

export const testRunQueue = new Queue('test-runs', {
  connection: new IORedis(REDIS_URL, { maxRetriesPerRequest: null }) as any
})

export function createTestRunWorker(processor: (jobData: unknown) => Promise<void>) {
  return new Worker('test-runs', async job => {
    await processor(job.data)
  }, {
    connection: new IORedis(REDIS_URL, { maxRetriesPerRequest: null }) as any
  })
}
