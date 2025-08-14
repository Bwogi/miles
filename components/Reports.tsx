"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { MileageEntry, Vehicle } from "@/types"
import { Car, AlertTriangle, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

interface ReportsProps {
  entries: MileageEntry[]
  vehicles: Vehicle[]
  supervisors: { id: string; name: string; badgeNumber: string; isActive: boolean }[]
}

export function Reports({ entries, vehicles }: ReportsProps) {
  // Get last 7 days for tracking
  const getLast7Days = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date.toISOString().split('T')[0])
    }
    return days
  }

  const last7Days = getLast7Days()
  const today = new Date().toISOString().split('T')[0]

  // Calculate mileage data for each vehicle
  const vehicleReports = vehicles.map(vehicle => {
    const vehicleEntries = entries.filter(entry => 
      entry.vehicleId === vehicle.id && 
      entry.status === 'completed'
    )

    const totalMiles = vehicleEntries.reduce((sum, entry) => sum + (entry.totalMiles || 0), 0)
    
    // Check which days have mileage entries
    const dailyStatus = last7Days.map(date => {
      const dayEntries = vehicleEntries.filter(entry => entry.date === date)
      const dayMiles = dayEntries.reduce((sum, entry) => sum + (entry.totalMiles || 0), 0)
      return {
        date,
        miles: dayMiles,
        hasEntry: dayEntries.length > 0,
        isToday: date === today
      }
    })

    const daysWithMileage = dailyStatus.filter(day => day.hasEntry).length
    const missingDays = dailyStatus.filter(day => !day.hasEntry)
    const todayStatus = dailyStatus.find(day => day.isToday)

    return {
      vehicle,
      totalMiles,
      daysWithMileage,
      dailyStatus,
      missingDays,
      todayStatus
    }
  })

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Vehicle Mileage Reports
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Simple overview of vehicle mileage and missing entries
        </p>
      </div>

      {/* Vehicle Reports */}
      <div className="space-y-4">
        {vehicleReports.map((report, index) => (
          <motion.div
            key={report.vehicle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle>{report.vehicle.name}</CardTitle>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {report.vehicle.licensePlate}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{report.totalMiles.toLocaleString()} miles</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {report.daysWithMileage}/7 days tracked
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Today's Status */}
                  <div className="flex items-center gap-2">
                    {report.todayStatus?.hasEntry ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          Today: {report.todayStatus.miles} miles added
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          Today: No mileage added yet
                        </span>
                      </>
                    )}
                  </div>

                  {/* 7-Day Overview */}
                  <div>
                    <h4 className="font-medium mb-2">Last 7 Days</h4>
                    <div className="grid grid-cols-7 gap-2">
                      {report.dailyStatus.map(day => (
                        <div key={day.date} className="text-center">
                          <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                            {formatDate(day.date).split(' ')[0]}
                          </div>
                          <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                            {formatDate(day.date).split(' ')[1]} {formatDate(day.date).split(' ')[2]}
                          </div>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mx-auto ${
                            day.hasEntry 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {day.hasEntry ? '✓' : '✗'}
                          </div>
                          {day.hasEntry && (
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                              {day.miles}mi
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Missing Days */}
                  {report.missingDays.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Missing Mileage ({report.missingDays.length} days)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {report.missingDays.map(day => (
                          <Badge key={day.date} variant="destructive">
                            {formatDate(day.date)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {vehicles.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-neutral-600 dark:text-neutral-400">
              No vehicles found. Add vehicles in the admin section to start tracking mileage.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
