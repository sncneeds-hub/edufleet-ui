/**
 * Browser Push Notifications Service
 * Handles registration, permission requests, and push event handling
 */

interface PushNotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  actions?: Array<{ action: string; title: string }>
}

interface NotificationPayload extends PushNotificationOptions {
  url?: string
}

export class PushNotificationService {
  private static instance: PushNotificationService
  private registration: ServiceWorkerRegistration | null = null
  private isSupported: boolean = false

  private constructor() {
    this.isSupported =
      'serviceWorker' in navigator &&
      'Notification' in window &&
      'PushManager' in window
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService()
    }
    return PushNotificationService.instance
  }

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications not supported in this browser')
      return false
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      console.log('Service Worker registered successfully')
      return true
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return false
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission
    }

    return 'denied'
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return Notification.permission === 'granted'
  }

  /**
   * Show a local notification (doesn't require service worker)
   */
  showNotification(options: PushNotificationOptions): Notification | null {
    if (!this.isEnabled()) {
      return null
    }

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/favicon.svg',
      badge: options.badge,
      tag: options.tag,
      requireInteraction: options.requireInteraction || false,
      actions: options.actions,
    })

    // Auto-close after 5 seconds if not requireInteraction
    if (!options.requireInteraction) {
      setTimeout(() => {
        if (notification) {
          notification.close()
        }
      }, 5000)
    }

    // Handle notification click
    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    return notification
  }

  /**
   * Show notification for event
   */
  notifyInstituteApproved(instituteName: string): void {
    this.showNotification({
      title: 'Institute Approved ✓',
      body: `${instituteName} has been approved and can now list vehicles.`,
      tag: 'institute-approved',
      icon: '/favicon.svg',
      actions: [{ action: 'view', title: 'View Details' }],
    })
  }

  /**
   * Notify institute rejected
   */
  notifyInstituteRejected(instituteName: string, reason: string): void {
    this.showNotification({
      title: 'Institute Registration Rejected',
      body: `${instituteName}: ${reason}`,
      tag: 'institute-rejected',
      icon: '/favicon.svg',
      requireInteraction: true,
      actions: [{ action: 'view', title: 'View Feedback' }],
    })
  }

  /**
   * Notify vehicle approved
   */
  notifyVehicleApproved(vehicleName: string): void {
    this.showNotification({
      title: 'Vehicle Approved ✓',
      body: `Your ${vehicleName} is now live and visible to buyers.`,
      tag: 'vehicle-approved',
      icon: '/favicon.svg',
      actions: [{ action: 'view', title: 'View Listing' }],
    })
  }

  /**
   * Notify vehicle rejected
   */
  notifyVehicleRejected(vehicleName: string, reason: string): void {
    this.showNotification({
      title: 'Vehicle Listing Rejected',
      body: `${vehicleName}: ${reason}`,
      tag: 'vehicle-rejected',
      icon: '/favicon.svg',
      requireInteraction: true,
      actions: [{ action: 'view', title: 'View Feedback' }],
    })
  }

  /**
   * Notify new inquiry
   */
  notifyNewInquiry(schoolName: string, vehicleName: string): void {
    this.showNotification({
      title: 'New Inquiry 🔔',
      body: `${schoolName} is interested in your ${vehicleName}.`,
      tag: 'new-inquiry',
      icon: '/favicon.svg',
      actions: [{ action: 'view', title: 'View Inquiry' }],
    })
  }

  /**
   * Notify inquiry reply
   */
  notifyInquiryReply(schoolName: string): void {
    this.showNotification({
      title: 'Inquiry Response',
      body: `${schoolName} replied to your inquiry.`,
      tag: 'inquiry-reply',
      icon: '/favicon.svg',
      actions: [{ action: 'view', title: 'View Response' }],
    })
  }

  /**
   * Notify vehicle sold
   */
  notifyVehicleSold(vehicleName: string, buyerName: string): void {
    this.showNotification({
      title: 'Vehicle Sold 🎉',
      body: `Your ${vehicleName} has been sold to ${buyerName}.`,
      tag: 'vehicle-sold',
      icon: '/favicon.svg',
      actions: [{ action: 'view', title: 'View Sale Details' }],
    })
  }

  /**
   * Notify custom event
   */
  notifyCustom(options: PushNotificationOptions): void {
    this.showNotification(options)
  }
}

export const pushNotifications = PushNotificationService.getInstance()
