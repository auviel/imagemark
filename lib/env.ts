/**
 * Environment Variable Management
 *
 * This module provides type-safe access to environment variables with validation.
 * All environment variables should be accessed through this module, not directly
 * from process.env.
 *
 * @example
 * ```ts
 * import { env } from '@/lib/env'
 *
 * // Type-safe access
 * const apiKey = env.SHORTPIXEL_API_KEY
 * ```
 */

import { z } from 'zod'

/**
 * Environment variable schema
 *
 * Defines all environment variables used by the application with their types
 * and validation rules.
 */
const envSchema = z.object({
  // Application Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.preprocess((val) => {
    if (val === '' || val === undefined || val === null) return undefined
    const str = String(val)
    try {
      new URL(str)
      return str
    } catch {
      return undefined
    }
  }, z.string().url().optional()),

  // ShortPixel API (Required for image optimization features)
  SHORTPIXEL_API_KEY: z.string().min(1).optional(),

  // Redis / Upstash (Required for Phase 3)
  UPSTASH_REDIS_REST_URL: z.preprocess((val) => {
    if (val === '' || val === undefined || val === null) return undefined
    const str = String(val)
    try {
      new URL(str)
      return str
    } catch {
      return undefined
    }
  }, z.string().url().optional()),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  REDIS_URL: z.preprocess((val) => {
    if (val === '' || val === undefined || val === null) return undefined
    const str = String(val)
    try {
      new URL(str)
      return str
    } catch {
      return undefined
    }
  }, z.string().url().optional()),
  REDIS_PASSWORD: z.string().optional(),

  // Error Tracking (Required for Phase 2)
  NEXT_PUBLIC_SENTRY_DSN: z.preprocess((val) => {
    // Convert empty strings or undefined to undefined
    if (val === '' || val === undefined) return undefined
    // If it's a string, try to validate it as URL, but don't fail if invalid
    // This allows the app to run even if Sentry DSN is misconfigured
    try {
      new URL(val as string)
      return val
    } catch {
      // Invalid URL - return undefined to make it optional
      return undefined
    }
  }, z.string().url().optional()),
  SENTRY_ENV: z.enum(['development', 'production', 'staging']).optional(),

  // CORS & Security
  ALLOWED_ORIGIN: z.string().optional(),

  // File Storage (Required for Phase 3)
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),

  // Database (Future - Phase 4+)
  POSTGRES_URL: z.preprocess((val) => {
    if (val === '' || val === undefined || val === null) return undefined
    const str = String(val)
    try {
      new URL(str)
      return str
    } catch {
      return undefined
    }
  }, z.string().url().optional()),
  SUPABASE_URL: z.preprocess((val) => {
    if (val === '' || val === undefined || val === null) return undefined
    const str = String(val)
    try {
      new URL(str)
      return str
    } catch {
      return undefined
    }
  }, z.string().url().optional()),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Development & Debugging
  ANALYZE: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  DEBUG: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
})

/**
 * Validated environment variables
 *
 * This will throw an error at startup if required environment variables
 * are missing or invalid.
 */
const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  SHORTPIXEL_API_KEY: process.env.SHORTPIXEL_API_KEY,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  REDIS_URL: process.env.REDIS_URL,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  SENTRY_ENV: process.env.SENTRY_ENV,
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN,
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
  POSTGRES_URL: process.env.POSTGRES_URL,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  ANALYZE: process.env.ANALYZE,
  DEBUG: process.env.DEBUG,
})

/**
 * Type-safe environment variables
 *
 * Use this instead of process.env directly.
 *
 * @example
 * ```ts
 * import { env } from '@/lib/env'
 *
 * if (env.NODE_ENV === 'production') {
 *   // Production-only code
 * }
 * ```
 */
export type Env = z.infer<typeof envSchema>

export { env }

/**
 * Helper function to check if a feature is enabled
 *
 * @param featureName - Name of the feature flag (without FEATURE_ prefix)
 * @returns true if the feature is enabled
 *
 * @example
 * ```ts
 * if (isFeatureEnabled('NEW_WATERMARK_UI')) {
 *   return <NewWatermarkUI />
 * }
 * ```
 */
export function isFeatureEnabled(featureName: string): boolean {
  const featureKey = `FEATURE_${featureName}` as keyof typeof process.env
  return process.env[featureKey] === 'true'
}

/**
 * Helper function to get required environment variable
 *
 * Throws an error if the variable is not set.
 *
 * @param key - Environment variable key
 * @param defaultValue - Optional default value
 * @returns The environment variable value
 *
 * @example
 * ```ts
 * const apiKey = getRequiredEnv('SHORTPIXEL_API_KEY')
 * ```
 */
export function getRequiredEnv<K extends keyof Env>(
  key: K,
  defaultValue?: Env[K]
): NonNullable<Env[K]> {
  const value = env[key]

  if (value === undefined || value === null) {
    if (defaultValue !== undefined) {
      return defaultValue as NonNullable<Env[K]>
    }
    throw new Error(
      `Missing required environment variable: ${String(key)}\n` +
        `Please set it in your .env.local file or environment.`
    )
  }

  return value as NonNullable<Env[K]>
}

/**
 * Check if we're in development mode
 */
export const isDev = env.NODE_ENV === 'development'

/**
 * Check if we're in production mode
 */
export const isProd = env.NODE_ENV === 'production'

/**
 * Check if we're in test mode
 */
export const isTest = env.NODE_ENV === 'test'
