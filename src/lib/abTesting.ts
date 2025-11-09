/**
 * A/B Testing Utility for Landing Page Optimization
 * 
 * Usage:
 * 1. Define variants for headlines, CTAs, or other elements
 * 2. Use getVariant() to select which variant to show
 * 3. Track conversion events with trackConversion()
 * 4. Analyze results to determine winning variant
 */

interface ABTestVariant {
  id: string
  name: string
  content: string
  weight?: number // Default: equal distribution
}

interface ABTest {
  id: string
  name: string
  variants: ABTestVariant[]
  active: boolean
}

// Define your A/B tests here
export const AB_TESTS: Record<string, ABTest> = {
  // Hero headline test
  heroHeadline: {
    id: 'hero_headline_v1',
    name: 'Hero Headline Test',
    active: true,
    variants: [
      {
        id: 'control',
        name: 'Control (Current)',
        content: 'Find Your Perfect School Vehicle in Minutes, Not Months',
        weight: 50
      },
      {
        id: 'variant_a',
        name: 'Variant A - Urgency',
        content: 'Buy or Sell School Vehicles Today - 500+ Verified Institutes',
        weight: 25
      },
      {
        id: 'variant_b',
        name: 'Variant B - Social Proof',
        content: 'Join 500+ Schools Trading Vehicles on India\'s #1 Marketplace',
        weight: 25
      }
    ]
  },
  
  // Primary CTA button test
  primaryCTA: {
    id: 'primary_cta_v1',
    name: 'Primary CTA Button Test',
    active: true,
    variants: [
      {
        id: 'control',
        name: 'Control (Current)',
        content: 'Start Selling Today – It\'s Free',
        weight: 50
      },
      {
        id: 'variant_a',
        name: 'Variant A - Value',
        content: 'List Your Vehicle Free',
        weight: 25
      },
      {
        id: 'variant_b',
        name: 'Variant B - Action',
        content: 'Get Started Now',
        weight: 25
      }
    ]
  },

  // Secondary CTA button test
  secondaryCTA: {
    id: 'secondary_cta_v1',
    name: 'Secondary CTA Button Test',
    active: true,
    variants: [
      {
        id: 'control',
        name: 'Control (Current)',
        content: 'Explore 50+ Vehicles',
        weight: 50
      },
      {
        id: 'variant_a',
        name: 'Variant A - Specific',
        content: 'Browse School Buses',
        weight: 25
      },
      {
        id: 'variant_b',
        name: 'Variant B - Action',
        content: 'Find Vehicles Now',
        weight: 25
      }
    ]
  }
}

/**
 * Get the variant for a specific test
 * Uses localStorage to ensure consistent variant per user
 */
export function getVariant(testId: string): ABTestVariant {
  const test = AB_TESTS[testId]
  
  if (!test || !test.active) {
    // Return control variant if test not found or inactive
    return test?.variants[0] || { id: 'control', name: 'Control', content: '' }
  }

  // Check if user already has an assigned variant
  const storageKey = `ab_test_${testId}`
  const storedVariantId = localStorage.getItem(storageKey)
  
  if (storedVariantId) {
    const variant = test.variants.find(v => v.id === storedVariantId)
    if (variant) return variant
  }

  // Assign new variant based on weights
  const totalWeight = test.variants.reduce((sum, v) => sum + (v.weight || 0), 0)
  const random = Math.random() * totalWeight
  
  let cumulative = 0
  for (const variant of test.variants) {
    cumulative += variant.weight || 0
    if (random <= cumulative) {
      // Store the assigned variant
      localStorage.setItem(storageKey, variant.id)
      return variant
    }
  }

  // Fallback to control
  const control = test.variants[0]
  localStorage.setItem(storageKey, control.id)
  return control
}

/**
 * Track a conversion event for A/B testing
 * In production, this would send data to analytics service
 */
export function trackConversion(testId: string, eventType: 'click' | 'signup' | 'listing_created') {
  const test = AB_TESTS[testId]
  if (!test || !test.active) return

  const variantId = localStorage.getItem(`ab_test_${testId}`)
  if (!variantId) return

  // Log conversion event
  const conversionData = {
    testId,
    variantId,
    eventType,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  }

  console.log('[A/B Test Conversion]', conversionData)

  // In production, send to analytics:
  // await fetch('/api/analytics/conversion', {
  //   method: 'POST',
  //   body: JSON.stringify(conversionData)
  // })

  // Store locally for now (for demonstration)
  const conversionsKey = `ab_conversions_${testId}`
  const existing = JSON.parse(localStorage.getItem(conversionsKey) || '[]')
  existing.push(conversionData)
  localStorage.setItem(conversionsKey, JSON.stringify(existing))
}

/**
 * Get conversion stats for a test (for admin review)
 */
export function getConversionStats(testId: string) {
  const conversionsKey = `ab_conversions_${testId}`
  const conversions = JSON.parse(localStorage.getItem(conversionsKey) || '[]')
  
  const stats: Record<string, { clicks: number; signups: number; listings: number }> = {}
  
  for (const conv of conversions) {
    if (!stats[conv.variantId]) {
      stats[conv.variantId] = { clicks: 0, signups: 0, listings: 0 }
    }
    
    if (conv.eventType === 'click') stats[conv.variantId].clicks++
    if (conv.eventType === 'signup') stats[conv.variantId].signups++
    if (conv.eventType === 'listing_created') stats[conv.variantId].listings++
  }

  return stats
}

/**
 * Reset all A/B tests (for testing)
 */
export function resetABTests() {
  Object.keys(AB_TESTS).forEach(testId => {
    localStorage.removeItem(`ab_test_${testId}`)
    localStorage.removeItem(`ab_conversions_${testId}`)
  })
  console.log('[A/B Test] All tests reset')
}
