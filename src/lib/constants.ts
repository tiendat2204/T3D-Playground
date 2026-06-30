export const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const TEST_CASE_STATUSES = ['draft', 'approved', 'disabled'] as const
export const TEST_RUN_STATUSES = ['queued', 'running', 'passed', 'failed', 'cancelled'] as const
export const RUN_TYPES = ['smoke', 'regression', 'impacted', 'manual'] as const
export const PRIORITIES = ['high', 'medium', 'low'] as const
export const BUG_REPORT_STATUSES = ['open', 'in-progress', 'resolved', 'closed'] as const

export const TAG_PRESETS = [
  '@smoke',
  '@regression',
  '@product',
  '@order',
  '@customer',
  '@auth',
  '@permission',
  '@import',
  '@new-feature'
] as const
