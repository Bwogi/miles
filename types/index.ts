export interface Vehicle {
  id: string
  name: string
  licensePlate: string
  isActive: boolean
}

export interface MileageEntry {
  id: string
  vehicleId: string
  supervisorName: string
  shift: 'first' | 'second'
  date: string
  startTime: string
  endTime?: string
  startMileage: number
  endMileage?: number
  totalMiles?: number
  notes?: string
  status: 'active' | 'completed'
}

export interface Supervisor {
  id: string
  name: string
  badgeNumber: string
  isActive: boolean
}
