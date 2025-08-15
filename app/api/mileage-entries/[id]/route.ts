import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import MileageEntry from '@/models/MileageEntry'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const body = await request.json()
    const { id } = await params
    
    const entry = await MileageEntry.findByIdAndUpdate(
      id,
      {
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
        status: body.status,
        startCondition: body.startCondition,
        startConditionNotes: body.startConditionNotes,
        endCondition: body.endCondition,
        endConditionNotes: body.endConditionNotes,
        startPhotos: body.startPhotos,
        endPhotos: body.endPhotos
      },
      { new: true, runValidators: true }
    )
    
    if (!entry) {
      return NextResponse.json(
        { success: false, error: 'Mileage entry not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: entry })
  } catch (error: unknown) {
    console.error('Error updating mileage entry:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update mileage entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    
    const entry = await MileageEntry.findByIdAndDelete(id)
    
    if (!entry) {
      return NextResponse.json(
        { success: false, error: 'Mileage entry not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: entry })
  } catch (error) {
    console.error('Error deleting mileage entry:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete mileage entry' },
      { status: 500 }
    )
  }
}
