"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { MileageEntry, Vehicle } from "@/types"
import { getCurrentShift, getShiftLabel, formatDate } from "@/lib/utils"
import { Car, Clock, MapPin, TrendingUp, Users, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"

interface DashboardProps {
  entries: MileageEntry[]
  vehicles: Vehicle[]
}

export function Dashboard({ entries, vehicles }: DashboardProps) {
  const currentShift = getCurrentShift()
  const today = new Date().toISOString().split('T')[0]
  
  // Calculate statistics
  const activeEntries = entries.filter(e => e.status === 'active')
  const todayEntries = entries.filter(e => e.date === today)
  const completedToday = todayEntries.filter(e => e.status === 'completed')
  const totalMilesToday = completedToday.reduce((sum, entry) => sum + (entry.totalMiles || 0), 0)
  const activeVehicles = vehicles.filter(v => v.isActive).length
  
  // Get shift statistics
  const firstShiftToday = todayEntries.filter(e => e.shift === 'first')
  const secondShiftToday = todayEntries.filter(e => e.shift === 'second')

  const stats = [
    {
      title: "Active Shifts",
      value: activeEntries.length,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      title: "Available Vehicles",
      value: activeVehicles,
      icon: Car,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    {
      title: "Miles Today",
      value: totalMilesToday.toLocaleString(),
      icon: MapPin,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    },
    {
      title: "Completed Shifts",
      value: completedToday.length,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Current Shift Banner */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold">{getShiftLabel(currentShift)}</h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {formatDate(new Date())} - Current shift is active
                </p>
              </div>
            </div>
            <Badge variant={currentShift === 'first' ? 'default' : 'secondary'} className="text-lg px-4 py-2">
              {currentShift === 'first' ? 'Day Shift' : 'Night Shift'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Shift Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Today's Shift Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">First Shift (5AM - 5PM)</span>
                </div>
                <Badge variant="outline">{firstShiftToday.length} entries</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="font-medium">Second Shift (5PM - 5AM)</span>
                </div>
                <Badge variant="outline">{secondShiftToday.length} entries</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Shifts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeEntries.length === 0 ? (
              <p className="text-neutral-500 text-center py-4">No active shifts at the moment</p>
            ) : (
              <div className="space-y-3">
                {activeEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <div>
                      <p className="font-medium">{vehicles.find(v => v.id === entry.vehicleId)?.name}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {entry.supervisorName} - {getShiftLabel(entry.shift)}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900">
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
