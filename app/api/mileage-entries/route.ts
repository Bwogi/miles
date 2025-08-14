import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import MileageEntry from '@/models/MileageEntry'

export async function GET() {
  try {
    await connectDB()
    const entries = await MileageEntry.find({}).sort({ createdAt: -1 })
    return NextResponse.json({ success: true, data: entries })
  } catch (error) {
    console.error('Error fetching mileage entries:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mileage entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    const entry = new MileageEntry({
      vehicleId: body.vehicleId,
      supervisorName: body.supervisorName,
      shift: body.shift,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      startMileage: body.startMileage,
      endMileage: body.endMileage,
      totalMiles: body.totalMiles,
      notes: body.notes,
      status: body.status
    })
    
    await entry.save()
    return NextResponse.json({ success: true, data: entry }, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      console.error('Error creating mileage entry:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create mileage entry' },
        { status: 500 }
      )
    } else {
      console.error('Error creating mileage entry:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create mileage entry' },
        { status: 500 }
      )
    }
  }
}
