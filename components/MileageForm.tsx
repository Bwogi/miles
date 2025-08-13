"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select } from "./ui/select"
import { Badge } from "./ui/badge"
import { getCurrentShift, getShiftLabel, formatTime } from "@/lib/utils"
import { MileageEntry, Vehicle, Supervisor } from "@/types"
import { Clock, Car, User, MapPin } from "lucide-react"

interface MileageFormProps {
  vehicles: Vehicle[]
  supervisors: Supervisor[]
  onSubmit: (entry: Omit<MileageEntry, 'id'>) => void
  activeEntry?: MileageEntry
  onEndShift?: (entryId: string, endMileage: number, notes?: string) => void
}

export function MileageForm({ vehicles, supervisors, onSubmit, activeEntry, onEndShift }: MileageFormProps) {
  const [formData, setFormData] = useState({
    vehicleId: '',
    supervisorName: '',
    startMileage: '',
    endMileage: '',
    notes: ''
  })

  const currentShift = getCurrentShift()
  const currentTime = new Date()

  const handleStartShift = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.vehicleId || !formData.supervisorName || !formData.startMileage) {
      alert('Please fill in all required fields')
      return
    }

    const entry: Omit<MileageEntry, 'id'> = {
      vehicleId: formData.vehicleId,
      supervisorName: formData.supervisorName,
      shift: currentShift,
      date: currentTime.toISOString().split('T')[0],
      startTime: currentTime.toISOString(),
      startMileage: parseInt(formData.startMileage),
      notes: formData.notes,
      status: 'active'
    }

    onSubmit(entry)
    setFormData({ vehicleId: '', supervisorName: '', startMileage: '', endMileage: '', notes: '' })
  }

  const handleEndShift = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.endMileage || !activeEntry) {
      alert('Please enter end mileage')
      return
    }

    onEndShift?.(activeEntry.id, parseInt(formData.endMileage), formData.notes)
    setFormData({ vehicleId: '', supervisorName: '', startMileage: '', endMileage: '', notes: '' })
  }

  const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId)
  const isEndingShift = !!activeEntry

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-lg sm:text-2xl">{isEndingShift ? 'End Shift' : 'Start Shift'}</span>
          </CardTitle>
          <Badge variant={currentShift === 'first' ? 'default' : 'secondary'} className="self-start sm:self-center">
            <span className="hidden sm:inline">{getShiftLabel(currentShift)}</span>
            <span className="sm:hidden">{currentShift === 'first' ? 'Day Shift' : 'Night Shift'}</span>
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
          Current time: {formatTime(currentTime)}
        </p>
      </CardHeader>

      <CardContent>
        {activeEntry && (
          <div className="mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 text-sm sm:text-base">Active Shift</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-blue-700 dark:text-blue-300 block">Vehicle:</span>
                <p className="font-medium truncate">{vehicles.find(v => v.id === activeEntry.vehicleId)?.name}</p>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300 block">Supervisor:</span>
                <p className="font-medium truncate">{activeEntry.supervisorName}</p>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300 block">Start Time:</span>
                <p className="font-medium">{formatTime(new Date(activeEntry.startTime))}</p>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300 block">Start Mileage:</span>
                <p className="font-medium">{activeEntry.startMileage.toLocaleString()} miles</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={isEndingShift ? handleEndShift : handleStartShift} className="space-y-4 sm:space-y-6">
          {!isEndingShift && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium flex items-center gap-2">
                  <Car className="h-3 w-3 sm:h-4 sm:w-4" />
                  Vehicle
                </label>
                <Select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData(prev => ({ ...prev, vehicleId: e.target.value }))}
                  required
                  className="text-sm"
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.filter(v => v.isActive).map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} - {vehicle.licensePlate}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium flex items-center gap-2">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  Supervisor
                </label>
                <Select
                  value={formData.supervisorName}
                  onChange={(e) => setFormData(prev => ({ ...prev, supervisorName: e.target.value }))}
                  required
                  className="text-sm"
                >
                  <option value="">Select supervisor</option>
                  {supervisors.filter(s => s.isActive).map(supervisor => (
                    <option key={supervisor.id} value={supervisor.name}>
                      {supervisor.name} - Badge #{supervisor.badgeNumber}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="text-xs sm:text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                  Starting Mileage
                </label>
                <Input
                  type="number"
                  placeholder="Enter starting mileage"
                  value={formData.startMileage}
                  onChange={(e) => setFormData(prev => ({ ...prev, startMileage: e.target.value }))}
                  required
                  className="text-sm sm:text-base"
                />
              </div>
            </div>
          )}

          {isEndingShift && (
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                Ending Mileage
              </label>
              <Input
                type="number"
                placeholder="Enter ending mileage"
                value={formData.endMileage}
                onChange={(e) => setFormData(prev => ({ ...prev, endMileage: e.target.value }))}
                required
                className="text-sm sm:text-base"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium">Notes (Optional)</label>
            <textarea
              className="flex min-h-[60px] sm:min-h-[80px] w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs sm:text-sm ring-offset-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300 resize-none"
              placeholder="Any additional notes or observations..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <Button type="submit" className="w-full text-sm sm:text-base" size="lg">
            {isEndingShift ? 'End Shift' : 'Start Shift'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
