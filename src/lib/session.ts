/**
 * SessionManager - Handles persistent storage of app state
 * Stores data to localStorage for seamless state restoration
 */

interface SessionData {
  [key: string]: unknown
}

export class SessionManager {
  private static readonly PREFIX = 'edufleet_'
  private static readonly AUTH_KEY = `${SessionManager.PREFIX}auth`
  private static readonly USER_KEY = `${SessionManager.PREFIX}user`
  private static readonly FILTERS_KEY = `${SessionManager.PREFIX}filters`
  private static readonly FORM_DATA_KEY = `${SessionManager.PREFIX}form_data`
  private static readonly SCROLL_POSITION_KEY = `${SessionManager.PREFIX}scroll_position`

  /**
   * Save authentication state
   */
  static saveAuthState(isAuthenticated: boolean, isLoading: boolean) {
    this.setItem('authState', { isAuthenticated, isLoading, timestamp: Date.now() })
  }

  /**
   * Get saved authentication state
   */
  static getAuthState() {
    return this.getItem('authState')
  }

  /**
   * Save user data
   */
  static saveUser(user: unknown) {
    this.setItem('user', { data: user, timestamp: Date.now() })
  }

  /**
   * Get saved user data
   */
  static getUser() {
    const item = this.getItem('user')
    return item ? item.data : null
  }

  /**
   * Save filter state for a specific page
   */
  static saveFilters(page: string, filters: SessionData) {
    const allFilters = this.getItem(SessionManager.FILTERS_KEY) || {}
    allFilters[page] = { ...filters, timestamp: Date.now() }
    this.setItem(SessionManager.FILTERS_KEY, allFilters)
  }

  /**
   * Get filter state for a specific page
   */
  static getFilters(page: string) {
    const allFilters = this.getItem(SessionManager.FILTERS_KEY) || {}
    return allFilters[page] || null
  }

  /**
   * Save form data (for draft preservation)
   */
  static saveFormData(formKey: string, data: SessionData) {
    const allForms = this.getItem(SessionManager.FORM_DATA_KEY) || {}
    allForms[formKey] = { ...data, timestamp: Date.now() }
    this.setItem(SessionManager.FORM_DATA_KEY, allForms)
  }

  /**
   * Get saved form data
   */
  static getFormData(formKey: string) {
    const allForms = this.getItem(SessionManager.FORM_DATA_KEY) || {}
    return allForms[formKey] || null
  }

  /**
   * Clear form data for a specific form
   */
  static clearFormData(formKey: string) {
    const allForms = this.getItem(SessionManager.FORM_DATA_KEY) || {}
    delete allForms[formKey]
    this.setItem(SessionManager.FORM_DATA_KEY, allForms)
  }

  /**
   * Save scroll position for a page
   */
  static saveScrollPosition(page: string, position: number) {
    const allPositions = this.getItem(SessionManager.SCROLL_POSITION_KEY) || {}
    allPositions[page] = { position, timestamp: Date.now() }
    this.setItem(SessionManager.SCROLL_POSITION_KEY, allPositions)
  }

  /**
   * Get saved scroll position
   */
  static getScrollPosition(page: string) {
    const allPositions = this.getItem(SessionManager.SCROLL_POSITION_KEY) || {}
    return allPositions[page]?.position || 0
  }

  /**
   * Clear all session data (on logout)
   */
  static clearAll() {
    try {
      const keys = Object.keys(localStorage).filter(key =>
        key.startsWith(SessionManager.PREFIX)
      )
      keys.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error('Error clearing session:', error)
    }
  }

  /**
   * Generic setter with error handling
   */
  private static setItem(key: string, value: unknown) {
    try {
      localStorage.setItem(
        `${SessionManager.PREFIX}${key}`,
        JSON.stringify(value)
      )
    } catch (error) {
      console.error(`Error saving ${key}:`, error)
    }
  }

  /**
   * Generic getter with error handling
   */
  private static getItem(key: string) {
    try {
      const item = localStorage.getItem(`${SessionManager.PREFIX}${key}`)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error reading ${key}:`, error)
      return null
    }
  }
}

// Constants for filter keys
export const FILTER_KEYS = {
  MY_VEHICLES: 'my_vehicles',
  VEHICLE_SEARCH: 'vehicle_search',
  SCHOOL_DASHBOARD: 'school_dashboard',
}

// Constants for form keys
export const FORM_KEYS = {
  POST_VEHICLE: 'post_vehicle',
  INSTITUTE_PROFILE: 'institute_profile',
  VEHICLE_EDIT: 'vehicle_edit',
}
