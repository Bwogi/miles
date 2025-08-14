import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Supervisor from '@/models/Supervisor'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const body = await request.json()
    const { id } = await params
    
    const supervisor = await Supervisor.findByIdAndUpdate(
      id,
      {
        name: body.name,
        badgeNumber: body.badgeNumber,
        isActive: body.isActive
      },
      { new: true, runValidators: true }
    )
    
    if (!supervisor) {
      return NextResponse.json(
        { success: false, error: 'Supervisor not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: supervisor })
  } catch (error: unknown) {
    console.error('Error updating supervisor:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Badge number already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update supervisor' },
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
    
    const supervisor = await Supervisor.findByIdAndDelete(id)
    
    if (!supervisor) {
      return NextResponse.json(
        { success: false, error: 'Supervisor not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: supervisor })
  } catch (error) {
    console.error('Error deleting supervisor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete supervisor' },
      { status: 500 }
    )
  }
}
