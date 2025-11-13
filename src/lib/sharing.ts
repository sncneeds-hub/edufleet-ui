/**
 * Social sharing utilities for vehicle listings
 */

interface ShareOptions {
  title: string
  text: string
  url: string
}

/**
 * Copy link to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Share via WhatsApp
 */
export function shareOnWhatsApp(options: ShareOptions): void {
  const message = `${options.title}\n\n${options.text}\n\n${options.url}`
  const encodedMessage = encodeURIComponent(message)
  const url = `https://wa.me/?text=${encodedMessage}`
  window.open(url, '_blank')
}

/**
 * Share via Email
 */
export function shareViaEmail(options: ShareOptions): void {
  const subject = encodeURIComponent(options.title)
  const body = encodeURIComponent(`${options.text}\n\n${options.url}`)
  const url = `mailto:?subject=${subject}&body=${body}`
  window.location.href = url
}

/**
 * Share on Facebook
 */
export function shareOnFacebook(url: string): void {
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  window.open(facebookUrl, '_blank', 'width=600,height=400')
}

/**
 * Share on Twitter
 */
export function shareOnTwitter(options: ShareOptions): void {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(options.title)}&url=${encodeURIComponent(options.url)}`
  window.open(twitterUrl, '_blank', 'width=600,height=400')
}

/**
 * Format vehicle share message
 */
export function formatVehicleShareMessage(vehicle: any): string {
  return `Check out this ${vehicle.year} ${vehicle.brand} ${vehicle.model} - ${vehicle.condition} condition - ₹${vehicle.price?.toLocaleString()} on EduFleet!`
}
