import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Vehicle from '@/models/Vehicle'

export async function GET() {
  try {
    await connectDB()
    const vehicles = await Vehicle.find({}).sort({ createdAt: -1 })
    return NextResponse.json({ success: true, data: vehicles })
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vehicles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    const vehicle = new Vehicle({
      name: body.name,
      licensePlate: body.licensePlate,
      isActive: body.isActive ?? true
    })
    
    await vehicle.save()
    return NextResponse.json({ success: true, data: vehicle }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating vehicle:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'License plate already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create vehicle' },
      { status: 500 }
    )
  }
}
