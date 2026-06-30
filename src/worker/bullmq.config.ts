import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
})

export const testRunQueue = new Queue('test-runs', { connection })

export function createTestRunWorker(processor: (jobData: unknown) => Promise<void>) {
  return new Worker('test-runs', async job => {
    await processor(job.data)
  }, { connection })
}
