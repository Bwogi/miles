import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

// Configure web-push only if VAPID keys are available
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:admin@vehicletracker.com',
    vapidPublicKey,
    vapidPrivateKey
  )
}

export async function POST(request: NextRequest) {
  try {
    const { title, body, targetType, targetId, data } = await request.json()
    
    // In production, fetch subscriptions from database based on targetType/targetId
    // For now, we'll use a simple notification payload
    
    const notificationPayload = {
      title,
      body,
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/icon-72x72.svg',
      data: data || {},
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    }
    
    // Here you would send to actual subscriptions
    // For demo purposes, we'll just log the notification
    console.log('Sending notification:', notificationPayload)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Notification sent successfully',
      payload: notificationPayload
    })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

// GET endpoint to test notification system
export async function GET() {
  return NextResponse.json({
    message: 'Notification sending service is ready',
    vapidConfigured: !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
  })
}
