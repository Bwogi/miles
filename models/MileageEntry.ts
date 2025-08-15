import mongoose from 'mongoose'

export interface IMileageEntry {
  _id?: string
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
  startPhotos?: Record<string, string>
  endPhotos?: Record<string, string>
  createdAt?: Date
  updatedAt?: Date
}

const MileageEntrySchema = new mongoose.Schema<IMileageEntry>({
  vehicleId: {
    type: String,
    required: [true, 'Vehicle ID is required'],
    ref: 'Vehicle'
  },
  supervisorName: {
    type: String,
    required: [true, 'Supervisor name is required'],
    trim: true
  },
  shift: {
    type: String,
    required: [true, 'Shift is required'],
    enum: ['first', 'second']
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    default: null
  },
  startMileage: {
    type: Number,
    required: [true, 'Start mileage is required'],
    min: [0, 'Start mileage cannot be negative']
  },
  endMileage: {
    type: Number,
    default: null,
    min: [0, 'End mileage cannot be negative']
  },
  totalMiles: {
    type: Number,
    default: null,
    min: [0, 'Total miles cannot be negative']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['active', 'completed'],
    default: 'active'
  },
  startCondition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'needs_attention'],
    default: null
  },
  startConditionNotes: {
    type: String,
    trim: true,
    maxlength: [200, 'Start condition notes cannot exceed 200 characters'],
    default: null
  },
  endCondition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'needs_attention'],
    default: null
  },
  endConditionNotes: {
    type: String,
    trim: true,
    maxlength: [200, 'End condition notes cannot exceed 200 characters'],
    default: null
  },
  startPhotos: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  endPhotos: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      ret.id = ret._id.toString()
      delete ret._id
      delete ret.__v
      return ret
    }
  }
})

// Create indexes for efficient queries
MileageEntrySchema.index({ vehicleId: 1, date: -1 })
MileageEntrySchema.index({ supervisorName: 1, date: -1 })
MileageEntrySchema.index({ status: 1 })
MileageEntrySchema.index({ date: -1 })
MileageEntrySchema.index({ shift: 1, date: -1 })

// Middleware to calculate totalMiles before saving
MileageEntrySchema.pre('save', function(next) {
  if (this.endMileage && this.startMileage) {
    this.totalMiles = this.endMileage - this.startMileage
  }
  next()
})

export default mongoose.models.MileageEntry || mongoose.model<IMileageEntry>('MileageEntry', MileageEntrySchema)
