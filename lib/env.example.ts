/**
 * Example usage of the env module
 *
 * This file demonstrates how to use the type-safe environment variables.
 * Delete this file once you understand the usage pattern.
 */

import { env, isDev, isProd, getRequiredEnv, isFeatureEnabled } from './env'

// Example 1: Basic usage
export function example1() {
  const nodeEnv = env.NODE_ENV
  const appUrl = env.NEXT_PUBLIC_APP_URL
}

// Example 2: Using helper functions
export function example2() {
  if (isDev) {
    // Development mode logic
  }

  if (isProd) {
    // Production mode logic
  }
}

// Example 3: Getting required variables (throws if missing)
export function example3() {
  try {
    const apiKey = getRequiredEnv('SHORTPIXEL_API_KEY')
    // Use apiKey
  } catch (error) {
    // Handle missing environment variable
  }
}

// Example 4: Feature flags
export function example4() {
  if (isFeatureEnabled('NEW_WATERMARK_UI')) {
    // return <NewWatermarkUI />
  } else {
    // return <LegacyWatermarkUI />
  }
}

// Example 5: Conditional logic based on environment
export function example5() {
  const apiUrl = isProd ? 'https://api.shortpixel.com/v2' : 'https://api-test.shortpixel.com/v2'
  // Use apiUrl
}

// Example 6: Using in API routes
export async function exampleApiRoute() {
  const apiKey = env.SHORTPIXEL_API_KEY

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ShortPixel API key not configured' }), {
      status: 500,
    })
  }

  // Use apiKey for API calls
}

// Example 7: Using in client components (only NEXT_PUBLIC_* vars)
export function exampleClientComponent() {
  const appUrl = env.NEXT_PUBLIC_APP_URL

  // const apiKey = env.SHORTPIXEL_API_KEY // ❌ Don't do this!

  // return <div>App URL: {appUrl || 'Not set'}</div>
  return `App URL: ${appUrl || 'Not set'}`
}
