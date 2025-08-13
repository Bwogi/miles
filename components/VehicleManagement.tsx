"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Vehicle } from "@/types"
import { Car, Plus, Edit, Trash2, Settings } from "lucide-react"
import { motion } from "framer-motion"

interface VehicleManagementProps {
  vehicles: Vehicle[]
  onAddVehicle: (vehicle: Omit<Vehicle, 'id'>) => void
  onUpdateVehicle: (id: string, vehicle: Partial<Vehicle>) => void
  onDeleteVehicle: (id: string) => void
}

export function VehicleManagement({ vehicles, onAddVehicle, onUpdateVehicle, onDeleteVehicle }: VehicleManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    licensePlate: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.licensePlate) {
      alert('Please fill in all fields')
      return
    }

    if (editingId) {
      onUpdateVehicle(editingId, {
        name: formData.name,
        licensePlate: formData.licensePlate.toUpperCase()
      })
      setEditingId(null)
    } else {
      onAddVehicle({
        name: formData.name,
        licensePlate: formData.licensePlate.toUpperCase(),
        isActive: true
      })
      setShowAddForm(false)
    }
    
    setFormData({ name: '', licensePlate: '' })
  }

  const handleEdit = (vehicle: Vehicle) => {
    setFormData({
      name: vehicle.name,
      licensePlate: vehicle.licensePlate
    })
    setEditingId(vehicle.id)
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingId(null)
    setFormData({ name: '', licensePlate: '' })
  }

  const toggleVehicleStatus = (id: string, currentStatus: boolean) => {
    onUpdateVehicle(id, { isActive: !currentStatus })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Vehicle Management
          </CardTitle>
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Vehicle
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg"
          >
            <h3 className="font-semibold mb-4">
              {editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Vehicle Name</label>
                  <Input
                    placeholder="e.g., Security Patrol Unit 1"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">License Plate</label>
                  <Input
                    placeholder="e.g., ABC-123"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData(prev => ({ ...prev, licensePlate: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? 'Update Vehicle' : 'Add Vehicle'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="space-y-3">
          {vehicles.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No vehicles registered yet</p>
              <p className="text-sm">Add your first vehicle to get started</p>
            </div>
          ) : (
            vehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <Car className="h-5 w-5 text-neutral-500" />
                  <div>
                    <h4 className="font-medium">{vehicle.name}</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      License: {vehicle.licensePlate}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={vehicle.isActive ? 'success' : 'secondary'}>
                    {vehicle.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleVehicleStatus(vehicle.id, vehicle.isActive)}
                    className={vehicle.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                  >
                    {vehicle.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(vehicle)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this vehicle?')) {
                        onDeleteVehicle(vehicle.id)
                      }
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
