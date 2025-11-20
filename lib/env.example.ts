/**
 * Example usage of the env module
 *
 * This file demonstrates how to use the type-safe environment variables.
 * Delete this file once you understand the usage pattern.
 */

import { env, isDev, isProd, getRequiredEnv, isFeatureEnabled } from './env'

// Example 1: Basic usage
export function example1() {
  // Type-safe access to environment variables
  const nodeEnv = env.NODE_ENV // Type: 'development' | 'production' | 'test'
  const appUrl = env.NEXT_PUBLIC_APP_URL // Type: string | undefined

  console.log(`Running in ${nodeEnv} mode`)
  if (appUrl) {
    console.log(`App URL: ${appUrl}`)
  }
}

// Example 2: Using helper functions
export function example2() {
  // Check environment
  if (isDev) {
    console.log('Development mode - enabling debug features')
  }

  if (isProd) {
    console.log('Production mode - enabling optimizations')
  }
}

// Example 3: Getting required variables (throws if missing)
export function example3() {
  try {
    // This will throw if SHORTPIXEL_API_KEY is not set
    const apiKey = getRequiredEnv('SHORTPIXEL_API_KEY')
    console.log('API key is set:', apiKey ? 'Yes' : 'No')
  } catch (error) {
    console.error('Missing required environment variable:', error)
  }
}

// Example 4: Feature flags
export function example4() {
  // Check if a feature is enabled
  if (isFeatureEnabled('NEW_WATERMARK_UI')) {
    console.log('New watermark UI is enabled')
    // return <NewWatermarkUI />
  } else {
    console.log('Using legacy watermark UI')
    // return <LegacyWatermarkUI />
  }
}

// Example 5: Conditional logic based on environment
export function example5() {
  const apiUrl = isProd ? 'https://api.shortpixel.com/v2' : 'https://api-test.shortpixel.com/v2'

  console.log(`Using API URL: ${apiUrl}`)
}

// Example 6: Using in API routes
export async function exampleApiRoute() {
  // In API routes, you can safely access env variables
  const apiKey = env.SHORTPIXEL_API_KEY

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ShortPixel API key not configured' }), {
      status: 500,
    })
  }

  // Use apiKey for API calls
  // ...
}

// Example 7: Using in client components (only NEXT_PUBLIC_* vars)
// Note: This is just an example - actual client components should be in .tsx files
export function exampleClientComponent() {
  // Only NEXT_PUBLIC_* variables are available in client components
  const appUrl = env.NEXT_PUBLIC_APP_URL

  // This will be undefined in client components:
  // const apiKey = env.SHORTPIXEL_API_KEY // ❌ Don't do this!

  // In actual .tsx files, you would return JSX:
  // return <div>App URL: {appUrl || 'Not set'}</div>
  return `App URL: ${appUrl || 'Not set'}`
}
