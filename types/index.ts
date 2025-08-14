export interface Vehicle {
  id: string
  name: string
  licensePlate: string
  isActive: boolean
}

export interface VehiclePhotos {
  front?: string
  back?: string
  leftSide?: string
  rightSide?: string
  frontInterior?: string
  backInterior?: string
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
  startCondition?: 'excellent' | 'good' | 'fair' | 'poor' | 'needs_attention'
  startConditionNotes?: string
  endCondition?: 'excellent' | 'good' | 'fair' | 'poor' | 'needs_attention'
  endConditionNotes?: string
  startPhotos?: VehiclePhotos
  endPhotos?: VehiclePhotos
}

export interface Supervisor {
  id: string
  name: string
  badgeNumber: string
  isActive: boolean
}
