import { createClient, type RedisClientType } from 'redis'
import { type CachedAIResult } from '@/types/ai'

const TTL_SECONDS = {
  testPlan: 86400,      // 24 hours
  codeGeneration: 604800, // 7 days
  failureAnalysis: 3600   // 1 hour
}

export class AICache {
  private redis: RedisClientType | null = null
  private prefix = 'ai-cache:'

  async connect() {
    this.redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    })
    await this.redis.connect()
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null
    const data = await this.redis.get(`${this.prefix}${key}`)
    if (!data) return null
    const cached: CachedAIResult = JSON.parse(data)
    if (new Date(cached.expiresAt) < new Date()) {
      await this.redis.del(`${this.prefix}${key}`)
      return null
    }
    return cached.result as T
  }

  async set(key: string, result: unknown, ttlType: keyof typeof TTL_SECONDS) {
    if (!this.redis) return
    const ttl = TTL_SECONDS[ttlType]
    const cached: CachedAIResult = {
      key,
      result,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + ttl * 1000)
    }
    await this.redis.setEx(`${this.prefix}${key}`, ttl, JSON.stringify(cached))
  }

  async invalidate(pattern: string) {
    if (!this.redis) return
    const keys = await this.redis.keys(`${this.prefix}${pattern}`)
    if (keys.length > 0) {
      await this.redis.del(keys)
    }
  }
}

export const aiCache = new AICache()
