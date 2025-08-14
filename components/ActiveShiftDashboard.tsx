"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { MileageEntry, Vehicle } from "@/types"
import { formatTime, getShiftLabel } from "@/lib/utils"
import { Car, Clock, MapPin, User, LogOut, FileText } from "lucide-react"
import { motion } from "framer-motion"

interface ActiveShiftDashboardProps {
  activeEntry: MileageEntry
  vehicle: Vehicle
  onEndShift: (endMileage: number, notes?: string) => void
  onLogout: () => void
}

export function ActiveShiftDashboard({ 
  activeEntry, 
  vehicle, 
  onEndShift, 
  onLogout 
}: ActiveShiftDashboardProps) {
  const [endMileage, setEndMileage] = useState('')
  const [notes, setNotes] = useState('')
  const [showEndShift, setShowEndShift] = useState(false)

  const handleEndShift = () => {
    if (!endMileage) {
      alert('Please enter ending mileage')
      return
    }

    const endMileageNum = parseInt(endMileage)
    if (endMileageNum < activeEntry.startMileage) {
      alert('Ending mileage cannot be less than starting mileage')
      return
    }

    onEndShift(endMileageNum, notes)
    setShowEndShift(false)
    setEndMileage('')
    setNotes('')
  }

  const currentTime = new Date()
  const shiftStartTime = new Date(activeEntry.startTime)
  const shiftDuration = Math.floor((currentTime.getTime() - shiftStartTime.getTime()) / (1000 * 60 * 60))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="space-y-6" suppressHydrationWarning>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  Active Shift
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {vehicle?.name} • {activeEntry.supervisorName}
                </p>
              </div>
              <Button
                onClick={onLogout}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Active Shift Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-gray-900/90 backdrop-blur-lg border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300 font-medium">Shift Details</span>
              </div>
              <div className="space-y-2">
                <div>
                  <Badge variant={activeEntry.shift === 'first' ? 'default' : 'secondary'}>
                    {getShiftLabel(activeEntry.shift)}
                  </Badge>
                </div>
                <div className="text-sm text-gray-400">
                  Started: {formatTime(shiftStartTime)}
                </div>
                <div className="text-sm text-gray-400">
                  Duration: {shiftDuration}h {Math.floor(((currentTime.getTime() - shiftStartTime.getTime()) % (1000 * 60 * 60)) / (1000 * 60))}m
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/90 backdrop-blur-lg border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <User className="h-5 w-5 text-green-400" />
                <span className="text-gray-300 font-medium">Supervisor</span>
              </div>
              <div className="text-white font-semibold">
                {activeEntry.supervisorName}
              </div>
              <div className="text-sm text-gray-400">
                On duty since {formatTime(shiftStartTime)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/90 backdrop-blur-lg border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="h-5 w-5 text-orange-400" />
                <span className="text-gray-300 font-medium">Mileage</span>
              </div>
              <div className="text-white font-semibold text-lg">
                {activeEntry.startMileage.toLocaleString()} miles
              </div>
              <div className="text-sm text-gray-400">
                Starting mileage
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Current Status */}
          <Card className="bg-gray-900/90 backdrop-blur-lg border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-600/20 border border-green-500/30 rounded-lg">
                  <div>
                    <div className="text-green-300 font-medium">Shift Active</div>
                    <div className="text-green-400/70 text-sm">Vehicle in service</div>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-gray-300 text-sm mb-2">Quick Stats</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Start Time</div>
                      <div className="text-white">{formatTime(shiftStartTime)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Current Time</div>
                      <div className="text-white">{formatTime(currentTime)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* End Shift */}
          <Card className="bg-gray-900/90 backdrop-blur-lg border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                End Shift
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showEndShift ? (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm">
                    Ready to end your shift? Click below to record final mileage and complete your shift.
                  </p>
                  <Button
                    onClick={() => setShowEndShift(true)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    End Shift
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Ending Mileage
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter ending mileage"
                      value={endMileage}
                      onChange={(e) => setEndMileage(e.target.value)}
                      className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                      min={activeEntry.startMileage}
                      max="9999999"
                      step="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      placeholder="Any notes about the shift..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full min-h-[80px] bg-gray-800/50 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleEndShift}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      Complete Shift
                    </Button>
                    <Button
                      onClick={() => setShowEndShift(false)}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Info */}
        {activeEntry.notes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Card className="bg-gray-900/90 backdrop-blur-lg border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Shift Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">{activeEntry.notes}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
