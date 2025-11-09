import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: 'edufleet-school-vehicle-marketplace-27qkw3wc',
  authRequired: false,
  auth: {
    mode: 'headless'
  }
})
