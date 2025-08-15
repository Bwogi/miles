import { NextRequest, NextResponse } from 'next/server'

// Store push subscriptions (in production, use a database)
const subscriptions = new Map<string, PushSubscription>()

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json()
    
    // Generate a unique ID for this subscription
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Store the subscription
    subscriptions.set(subscriptionId, subscription)
    
    console.log('New push subscription registered:', subscriptionId)
    
    return NextResponse.json({ 
      success: true, 
      subscriptionId,
      message: 'Successfully subscribed to push notifications' 
    })
  } catch (error) {
    console.error('Error registering push subscription:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to register subscription' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    totalSubscriptions: subscriptions.size,
    message: 'Push notification service is running'
  })
}
