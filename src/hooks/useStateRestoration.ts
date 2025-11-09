/**
 * useStateRestoration - Hook for restoring app state on mount
 * Restores filters, form data, and scroll positions seamlessly
 */

import { useEffect, useRef } from 'react'
import { SessionManager, FILTER_KEYS, FORM_KEYS } from '@/lib/session'

// Re-export constants for convenience
export { FILTER_KEYS, FORM_KEYS }

interface RestoreOptions {
  filterKey?: string
  formKey?: string
  scrollToTop?: boolean
}

export function useStateRestoration(options: RestoreOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { filterKey, formKey, scrollToTop = false } = options

  /**
   * Restore scroll position on mount
   */
  useEffect(() => {
    if (scrollToTop) {
      window.scrollTo(0, 0)
      return
    }

    if (filterKey) {
      const savedPosition = SessionManager.getScrollPosition(filterKey)
      if (savedPosition > 0) {
        setTimeout(() => {
          window.scrollTo(0, savedPosition)
        }, 100)
      }
    }

    if (containerRef.current) {
      const savedPosition = SessionManager.getScrollPosition(containerRef.current.id || 'default')
      if (savedPosition > 0) {
        setTimeout(() => {
          containerRef.current?.scrollTo(0, savedPosition)
        }, 100)
      }
    }
  }, [filterKey, scrollToTop])

  /**
   * Save scroll position on unmount
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (filterKey) {
        SessionManager.saveScrollPosition(filterKey, window.scrollY)
      }
      if (containerRef.current?.id) {
        SessionManager.saveScrollPosition(containerRef.current.id, containerRef.current.scrollTop)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [filterKey])

  /**
   * Restore filters
   */
  const restoreFilters = () => {
    if (!filterKey) return null
    return SessionManager.getFilters(filterKey)
  }

  /**
   * Save filters
   */
  const saveFilters = (filters: Record<string, unknown>) => {
    if (!filterKey) return
    SessionManager.saveFilters(filterKey, filters)
  }

  /**
   * Restore form data
   */
  const restoreFormData = () => {
    if (!formKey) return null
    return SessionManager.getFormData(formKey)
  }

  /**
   * Save form data
   */
  const saveFormData = (data: Record<string, unknown>) => {
    if (!formKey) return
    SessionManager.saveFormData(formKey, data)
  }

  /**
   * Clear saved form data
   */
  const clearFormData = () => {
    if (!formKey) return
    SessionManager.clearFormData(formKey)
  }

  return {
    containerRef,
    restoreFilters,
    saveFilters,
    restoreFormData,
    saveFormData,
    clearFormData,
  }
}

/**
 * useScrollRestoration - Simpler hook just for scroll position
 */
export function useScrollRestoration(pageKey: string) {
  useEffect(() => {
    const savedPosition = SessionManager.getScrollPosition(pageKey)
    if (savedPosition > 0) {
      setTimeout(() => {
        window.scrollTo(0, savedPosition)
      }, 50)
    }

    return () => {
      SessionManager.saveScrollPosition(pageKey, window.scrollY)
    }
  }, [pageKey])
}

/**
 * useFormDraft - Hook for managing form drafts with persistence
 */
export function useFormDraft(formKey: string) {
  const restoreFormData = () => {
    const saved = SessionManager.getFormData(formKey)
    return saved ? { ...saved } : null
  }

  const saveDraft = (data: Record<string, unknown>) => {
    SessionManager.saveFormData(formKey, data)
  }

  const clearDraft = () => {
    SessionManager.clearFormData(formKey)
  }

  const hasDraft = () => {
    return SessionManager.getFormData(formKey) !== null
  }

  return {
    restoreFormData,
    saveDraft,
    clearDraft,
    hasDraft,
  }
}
