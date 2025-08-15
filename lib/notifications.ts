// Push Notification Utilities for Security Vehicle Tracker PWA

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// Send local notification (when app is open)
export async function sendLocalNotification(payload: NotificationPayload): Promise<void> {
  const hasPermission = await requestNotificationPermission()
  
  if (!hasPermission) {
    console.warn('Notification permission not granted')
    return
  }

  const notification = new Notification(payload.title, {
    body: payload.body,
    icon: payload.icon || '/icon-192x192.png',
    badge: payload.badge || '/icon-72x72.png',
    tag: payload.tag,
    data: payload.data
    // Note: actions are only supported in service worker push notifications
  })

  // Auto-close after 5 seconds
  setTimeout(() => notification.close(), 5000)
}

// Send push notification through service worker (supports actions)
export async function sendPushNotification(payload: NotificationPayload): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service worker not supported, falling back to local notification')
    await sendLocalNotification(payload)
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready
    
    // Send message to service worker to display notification
    registration.active?.postMessage({
      type: 'SHOW_NOTIFICATION',
      payload
    })
  } catch (error) {
    console.error('Failed to send push notification:', error)
    // Fallback to local notification
    await sendLocalNotification(payload)
  }
}

// Register for push notifications (requires service worker)
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    })

    // Send subscription to your backend
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    })

    return subscription
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error)
    return null
  }
}

// Predefined notification templates for security operations
export const NotificationTemplates = {
  shiftReminder: (supervisorName: string): NotificationPayload => ({
    title: '🚗 Shift Starting Soon',
    body: `Hi ${supervisorName}, your shift starts in 15 minutes. Don't forget to log your starting mileage!`,
    tag: 'shift-reminder',
    actions: [
      { action: 'start-shift', title: 'Start Shift' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  }),

  endShiftReminder: (vehicleName: string): NotificationPayload => ({
    title: '⏰ End Shift Reminder',
    body: `Please log your ending mileage for ${vehicleName} and complete your shift.`,
    tag: 'end-shift-reminder',
    actions: [
      { action: 'end-shift', title: 'End Shift' },
      { action: 'snooze', title: 'Remind Later' }
    ]
  }),

  missingMileage: (date: string): NotificationPayload => ({
    title: '📋 Missing Mileage Entry',
    body: `You haven't logged mileage for ${date}. Please update your records.`,
    tag: 'missing-mileage',
    actions: [
      { action: 'add-mileage', title: 'Add Mileage' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  }),

  vehicleCondition: (vehicleName: string): NotificationPayload => ({
    title: '🔧 Vehicle Condition Check',
    body: `Please inspect and report the condition of ${vehicleName} before starting your shift.`,
    tag: 'vehicle-condition',
    actions: [
      { action: 'inspect-vehicle', title: 'Inspect Now' },
      { action: 'dismiss', title: 'Already Done' }
    ]
  }),

  emergencyAlert: (message: string): NotificationPayload => ({
    title: '🚨 Emergency Alert',
    body: message,
    tag: 'emergency',
    actions: [
      { action: 'acknowledge', title: 'Acknowledge' },
      { action: 'respond', title: 'Respond' }
    ]
  }),

  newVehicle: (vehicleName: string): NotificationPayload => ({
    title: '🚗 New Vehicle Added',
    body: `${vehicleName} has been added to the fleet and is available for shifts.`,
    tag: 'new-vehicle'
  }),

  systemUpdate: (): NotificationPayload => ({
    title: '🔄 App Updated',
    body: 'Vehicle Tracker has been updated with new features. Restart the app to apply changes.',
    tag: 'system-update',
    actions: [
      { action: 'restart', title: 'Restart App' },
      { action: 'later', title: 'Later' }
    ]
  })
}

// Utility functions for common notification scenarios
export class SecurityNotifications {
  static async notifyShiftStart(supervisorName: string) {
    await sendLocalNotification(NotificationTemplates.shiftReminder(supervisorName))
  }

  static async notifyShiftEnd(vehicleName: string) {
    await sendLocalNotification(NotificationTemplates.endShiftReminder(vehicleName))
  }

  static async notifyMissingMileage(date: string) {
    await sendLocalNotification(NotificationTemplates.missingMileage(date))
  }

  static async notifyVehicleInspection(vehicleName: string) {
    await sendLocalNotification(NotificationTemplates.vehicleCondition(vehicleName))
  }

  static async sendEmergencyAlert(message: string) {
    await sendLocalNotification(NotificationTemplates.emergencyAlert(message))
  }

  static async notifyNewVehicle(vehicleName: string) {
    await sendLocalNotification(NotificationTemplates.newVehicle(vehicleName))
  }

  static async notifySystemUpdate() {
    await sendLocalNotification(NotificationTemplates.systemUpdate())
  }
}

// Schedule recurring notifications
export function scheduleShiftReminders() {
  // Schedule daily shift reminders
  const scheduleReminder = (hour: number, minute: number, shiftType: 'first' | 'second') => {
    const now = new Date()
    const reminderTime = new Date()
    reminderTime.setHours(hour, minute, 0, 0)
    
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1)
    }
    
    const timeUntilReminder = reminderTime.getTime() - now.getTime()
    
    setTimeout(() => {
      SecurityNotifications.notifyShiftStart('Supervisor')
      // Reschedule for next day
      scheduleShiftReminders()
    }, timeUntilReminder)
  }
  
  // First shift reminder at 4:45 AM
  scheduleReminder(4, 45, 'first')
  // Second shift reminder at 4:45 PM
  scheduleReminder(16, 45, 'second')
}
