"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { VehicleCamera } from "./VehicleCamera"
import { Vehicle, Supervisor, MileageEntry, VehiclePhotos } from "@/types"
import { getCurrentShift, getShiftLabel } from "@/lib/utils"
import { Car, User, Clock, MapPin, Building, ArrowRight, Sun, Moon } from "lucide-react"

interface ShiftSelectorProps {
  vehicles: Vehicle[]
  supervisors: { id: string; name: string; badgeNumber: string; isActive: boolean }[]
  onStartShift: (data: {
    vehicleId: string
    supervisorName: string
    shift: 'first' | 'second'
    startMileage: number
    startCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'needs_attention'
    startConditionNotes?: string
    startPhotos?: VehiclePhotos
  }) => void
  activeEntry?: MileageEntry
}

export function ShiftSelector({ vehicles, supervisors, onStartShift }: ShiftSelectorProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('')
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('')
  const [startMileage, setStartMileage] = useState('')
  const [selectedShift, setSelectedShift] = useState<'first' | 'second'>(getCurrentShift())
  const [startCondition, setStartCondition] = useState<'excellent' | 'good' | 'fair' | 'poor' | 'needs_attention'>('good')
  const [startConditionNotes, setStartConditionNotes] = useState('')
  const [startPhotos, setStartPhotos] = useState<VehiclePhotos>({})

  const handleSubmit = () => {
    if (!selectedVehicle || !selectedSupervisor || !startMileage) {
      alert('Please fill in all fields')
      return
    }

    onStartShift({
      vehicleId: selectedVehicle,
      supervisorName: selectedSupervisor,
      shift: selectedShift,
      startMileage: parseInt(startMileage),
      startCondition: startCondition,
      startConditionNotes: startConditionNotes.trim() || undefined,
      startPhotos: Object.keys(startPhotos).length > 0 ? startPhotos : undefined
    })

    // Reset form
    setSelectedVehicle('')
    setSelectedSupervisor('')
    setStartMileage('')
  }

  const activeVehicles = vehicles.filter(v => v.isActive)
  const activeSupervisors = supervisors.filter(s => s.isActive)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-2">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-gray-900/90 backdrop-blur-lg border-gray-700 shadow-2xl">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Car className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Security Vehicle Tracker
              </h1>
              <p className="text-gray-400 text-sm">
                Select your vehicle to continue
              </p>
            </div>

             {/* Vehicle Selection */}
             <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-3">
                {/* Select Your Vehicle */}
              </label>
              <div className="space-y-2">
                {activeVehicles.map((vehicle) => (
                  <motion.button
                    key={vehicle.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedVehicle(vehicle.id)}
                    className={`w-full p-4 rounded-lg border transition-all ${
                      selectedVehicle === vehicle.id
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-gray-800/30 border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">{vehicle.name}</div>
                        <div className="text-sm opacity-75">{vehicle.licensePlate}</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Supervisor Selection */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-3">
                Supervisor Identification
              </label>
              <div className="space-y-2">
                {activeSupervisors.map((supervisor) => (
                  <motion.button
                    key={supervisor.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedSupervisor(supervisor.name)}
                    className={`w-full p-3 rounded-lg border transition-all ${
                      selectedSupervisor === supervisor.name
                        ? 'bg-green-600/20 border-green-500 text-green-300'
                        : 'bg-gray-800/30 border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">{supervisor.name}</div>
                        <div className="text-sm opacity-75">Badge #{supervisor.badgeNumber}</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

             {/* Shift Selection */}
             <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-3">
                Select Your Shift
              </label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedShift('first')}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedShift === 'first'
                      ? 'bg-orange-600/20 border-orange-500 text-orange-300'
                      : 'bg-gray-800/30 border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-medium">Morning</div>
                    <div className="text-xs opacity-75">5:00 AM Shift</div>
                  </div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedShift('second')}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedShift === 'second'
                      ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                      : 'bg-gray-800/30 border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-medium">Evening</div>
                    <div className="text-xs opacity-75">5:00 PM Shift</div>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Current Shift Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300 text-sm">Current Shift</span>
                </div>
                <Badge variant={selectedShift === 'first' ? 'default' : 'secondary'} className="text-xs">
                  {getShiftLabel(selectedShift)}
                </Badge>
              </div>
            </div>

           

            {/* Starting Mileage */}
            <div className="mb-8">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Starting Mileage
              </label>
              <Input
                type="number"
                placeholder="Enter current mileage"
                value={startMileage}
                onChange={(e) => setStartMileage(e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                min="0"
                max="9999999"
                step="1"
              />
            </div>

            {/* Vehicle Condition Assessment */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-3">
                Vehicle Condition Assessment
              </label>
              <div className="space-y-3">
                {/* Condition Rating */}
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-2">
                    Overall Condition
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'excellent', label: 'Excellent', color: 'bg-green-600/20 border-green-500 text-green-300' },
                      { value: 'good', label: 'Good', color: 'bg-blue-600/20 border-blue-500 text-blue-300' },
                      { value: 'fair', label: 'Fair', color: 'bg-yellow-600/20 border-yellow-500 text-yellow-300' },
                      { value: 'poor', label: 'Poor', color: 'bg-orange-600/20 border-orange-500 text-orange-300' },
                      { value: 'needs_attention', label: 'Needs Attention', color: 'bg-red-600/20 border-red-500 text-red-300' }
                    ].map((condition) => (
                      <motion.button
                        key={condition.value}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setStartCondition(condition.value as 'excellent' | 'good' | 'fair' | 'poor' | 'needs_attention')}
                        className={`p-2 rounded-lg border transition-all text-sm ${
                          startCondition === condition.value
                            ? condition.color
                            : 'bg-gray-800/30 border-gray-600 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        {condition.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Condition Notes */}
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    placeholder="Any issues, damage, or observations..."
                    value={startConditionNotes}
                    onChange={(e) => setStartConditionNotes(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 resize-none"
                    rows={2}
                    maxLength={200}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {startConditionNotes.length}/200
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Photo Documentation */}
            <div className="mb-6">
              <VehicleCamera
                photos={startPhotos}
                onPhotosChange={setStartPhotos}
                title="Images"
                isRequired={false}
              />
            </div>

            {/* Access Button */}
            <Button
              onClick={handleSubmit}
              disabled={!selectedVehicle || !selectedSupervisor || !startMileage}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-2">
                <span>Access Vehicle System</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            </Button>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-xs">
                You&apos;ll only see miles for your selected vehicle
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
