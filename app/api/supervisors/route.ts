import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Supervisor from '@/models/Supervisor'

export async function GET() {
  try {
    await connectDB()
    const supervisors = await Supervisor.find({}).sort({ createdAt: -1 })
    return NextResponse.json({ success: true, data: supervisors })
  } catch (error) {
    console.error('Error fetching supervisors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch supervisors' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    const supervisor = new Supervisor({
      name: body.name,
      badgeNumber: body.badgeNumber,
      isActive: body.isActive ?? true
    })
    
    await supervisor.save()
    return NextResponse.json({ success: true, data: supervisor }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating supervisor:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Badge number already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create supervisor' },
      { status: 500 }
    )
  }
}
