import mongoose from 'mongoose'

export interface ISupervisor {
  _id?: string
  name: string
  badgeNumber: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

const SupervisorSchema = new mongoose.Schema<ISupervisor>({
  name: {
    type: String,
    required: [true, 'Supervisor name is required'],
    trim: true,
    maxlength: [100, 'Supervisor name cannot exceed 100 characters']
  },
  badgeNumber: {
    type: String,
    required: [true, 'Badge number is required'],
    trim: true,
    maxlength: [20, 'Badge number cannot exceed 20 characters']
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
SupervisorSchema.index({ badgeNumber: 1 }, { unique: true })
SupervisorSchema.index({ isActive: 1 })

export default mongoose.models.Supervisor || mongoose.model<ISupervisor>('Supervisor', SupervisorSchema)
