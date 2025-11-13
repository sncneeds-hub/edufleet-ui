import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Bell, Check, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { pushNotifications } from '@/lib/pushNotifications'

interface NotificationPreference {
  type: string
  label: string
  description: string
  enabled: boolean
}

export function NotificationPreferences() {
  const { toast } = useToast()
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      type: 'institute_approved',
      label: 'Institute Approved',
      description: 'Notify when your institute is approved',
      enabled: true,
    },
    {
      type: 'institute_rejected',
      label: 'Institute Rejected',
      description: 'Notify when your institute registration is rejected',
      enabled: true,
    },
    {
      type: 'vehicle_approved',
      label: 'Vehicle Approved',
      description: 'Notify when your vehicle listing is approved',
      enabled: true,
    },
    {
      type: 'vehicle_rejected',
      label: 'Vehicle Rejected',
      description: 'Notify when your vehicle listing is rejected',
      enabled: true,
    },
    {
      type: 'new_inquiry',
      label: 'New Inquiry',
      description: 'Notify when someone shows interest in your vehicle',
      enabled: true,
    },
    {
      type: 'inquiry_reply',
      label: 'Inquiry Reply',
      description: 'Notify when seller replies to your inquiry',
      enabled: true,
    },
    {
      type: 'vehicle_sold',
      label: 'Vehicle Sold',
      description: 'Notify when your vehicle has been sold',
      enabled: true,
    },
  ])

  const [pushEnabled, setPushEnabled] = useState(false)
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load preferences from localStorage
    const saved = localStorage.getItem('notificationPreferences')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setPreferences(parsed)
      } catch (e) {
        console.error('Failed to parse preferences:', e)
      }
    }

    // Check if push notifications are enabled
    setPushEnabled(pushNotifications.isEnabled())

    // Check email preference
    const emailPref = localStorage.getItem('emailNotificationsEnabled')
    setEmailEnabled(emailPref !== 'false')
  }, [])

  const handlePreferenceChange = (type: string) => {
    setPreferences(prev =>
      prev.map(pref =>
        pref.type === type ? { ...pref, enabled: !pref.enabled } : pref
      )
    )
  }

  const handleSavePreferences = async () => {
    setLoading(true)
    try {
      localStorage.setItem('notificationPreferences', JSON.stringify(preferences))

      // Send preferences to backend
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ preferences }),
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }

      toast({
        title: 'Success',
        description: 'Notification preferences updated',
      })
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast({
        title: 'Error',
        description: 'Failed to save preferences',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEnablePushNotifications = async () => {
    setLoading(true)
    try {
      const permission = await pushNotifications.requestPermission()

      if (permission === 'granted') {
        setPushEnabled(true)
        toast({
          title: 'Success',
          description: 'Push notifications enabled',
        })
      } else {
        toast({
          title: 'Permission Denied',
          description: 'Please enable notifications in your browser settings',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error enabling push notifications:', error)
      toast({
        title: 'Error',
        description: 'Failed to enable push notifications',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleEmailNotifications = () => {
    const newState = !emailEnabled
    setEmailEnabled(newState)
    localStorage.setItem('emailNotificationsEnabled', String(newState))

    toast({
      title: 'Success',
      description: `Email notifications ${newState ? 'enabled' : 'disabled'}`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Browser Notifications
          </CardTitle>
          <CardDescription>
            Receive alerts directly in your browser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pushEnabled ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">
                Browser notifications enabled
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-700">
                Browser notifications disabled
              </span>
            </div>
          )}

          <Button
            onClick={handleEnablePushNotifications}
            disabled={pushEnabled || loading}
            variant={pushEnabled ? 'outline' : 'default'}
          >
            {pushEnabled ? 'Enabled' : 'Enable Browser Notifications'}
          </Button>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Receive important updates via email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Email Alerts</p>
              <p className="text-sm text-gray-500">
                Get notified about critical events via email
              </p>
            </div>
            <Switch
              checked={emailEnabled}
              onCheckedChange={handleToggleEmailNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Events</CardTitle>
          <CardDescription>
            Choose which events trigger notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {preferences.map(pref => (
            <div
              key={pref.type}
              className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{pref.label}</p>
                <p className="text-xs text-gray-500">{pref.description}</p>
              </div>
              <Switch
                checked={pref.enabled}
                onCheckedChange={() => handlePreferenceChange(pref.type)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSavePreferences}
        disabled={loading}
        size="lg"
        className="w-full"
      >
        {loading ? 'Saving...' : 'Save Notification Preferences'}
      </Button>
    </div>
  )
}
