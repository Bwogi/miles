import mongoose from 'mongoose'

export interface IVehicle {
  _id?: string
  name: string
  licensePlate: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

const VehicleSchema = new mongoose.Schema<IVehicle>({
  name: {
    type: String,
    required: [true, 'Vehicle name is required'],
    trim: true,
    maxlength: [100, 'Vehicle name cannot exceed 100 characters']
  },
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    trim: true,
    uppercase: true,
    maxlength: [20, 'License plate cannot exceed 20 characters']
  },
  isActive: {
    type: Boolean,
    default: true
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

// Create index for efficient queries
VehicleSchema.index({ licensePlate: 1 }, { unique: true })
VehicleSchema.index({ isActive: 1 })

export default mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema)
