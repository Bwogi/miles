import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Vehicle from '@/models/Vehicle'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const body = await request.json()
    const { id } = await params
    
    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      {
        name: body.name,
        licensePlate: body.licensePlate,
        isActive: body.isActive
      },
      { new: true, runValidators: true }
    )
    
    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: vehicle })
  } catch (error: unknown) {
    console.error('Error updating vehicle:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'License plate already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update vehicle' },
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
    
    const vehicle = await Vehicle.findByIdAndDelete(id)
    
    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: vehicle })
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete vehicle' },
      { status: 500 }
    )
  }
}
