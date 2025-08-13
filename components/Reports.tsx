"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Select } from "./ui/select"
import { Badge } from "./ui/badge"
import { MileageEntry, Vehicle, Supervisor } from "@/types"
import { formatDate, formatTime, getShiftLabel } from "@/lib/utils"
import { FileText, Download, Calendar, TrendingUp, BarChart3, PieChart, Filter } from "lucide-react"
import { motion } from "framer-motion"

interface ReportsProps {
  entries: MileageEntry[]
  vehicles: Vehicle[]
  supervisors: Supervisor[]
}

type ReportPeriod = 'today' | 'week' | 'month' | 'all'
type ReportType = 'summary' | 'detailed' | 'vehicle' | 'supervisor'

export function Reports({ entries, vehicles, supervisors }: ReportsProps) {
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('week')
  const [reportType, setReportType] = useState<ReportType>('summary')
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all')
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('all')

  // Filter entries based on selected period
  const filteredEntries = useMemo(() => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    
    let startDate: Date
    
    switch (reportPeriod) {
      case 'today':
        return entries.filter(entry => entry.date === today)
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        return entries
    }
    
    return entries.filter(entry => new Date(entry.date) >= startDate)
  }, [entries, reportPeriod])

  // Further filter by vehicle and supervisor
  const finalFilteredEntries = useMemo(() => {
    let filtered = filteredEntries
    
    if (selectedVehicle !== 'all') {
      filtered = filtered.filter(entry => entry.vehicleId === selectedVehicle)
    }
    
    if (selectedSupervisor !== 'all') {
      filtered = filtered.filter(entry => entry.supervisorName === selectedSupervisor)
    }
    
    return filtered
  }, [filteredEntries, selectedVehicle, selectedSupervisor])

  // Calculate statistics
  const stats = useMemo(() => {
    const completed = finalFilteredEntries.filter(entry => entry.status === 'completed')
    const totalMiles = completed.reduce((sum, entry) => sum + (entry.totalMiles || 0), 0)
    const totalShifts = completed.length
    const activeShifts = finalFilteredEntries.filter(entry => entry.status === 'active').length
    
    const firstShifts = completed.filter(entry => entry.shift === 'first').length
    const secondShifts = completed.filter(entry => entry.shift === 'second').length
    
    const avgMilesPerShift = totalShifts > 0 ? totalMiles / totalShifts : 0
    
    // Vehicle usage
    const vehicleUsage = vehicles.map(vehicle => {
      const vehicleEntries = completed.filter(entry => entry.vehicleId === vehicle.id)
      const vehicleMiles = vehicleEntries.reduce((sum, entry) => sum + (entry.totalMiles || 0), 0)
      return {
        vehicle: vehicle.name,
        shifts: vehicleEntries.length,
        miles: vehicleMiles
      }
    })
    
    // Supervisor performance
    const supervisorPerformance = supervisors.map(supervisor => {
      const supervisorEntries = completed.filter(entry => entry.supervisorName === supervisor.name)
      const supervisorMiles = supervisorEntries.reduce((sum, entry) => sum + (entry.totalMiles || 0), 0)
      return {
        supervisor: supervisor.name,
        shifts: supervisorEntries.length,
        miles: supervisorMiles
      }
    })
    
    return {
      totalMiles,
      totalShifts,
      activeShifts,
      firstShifts,
      secondShifts,
      avgMilesPerShift,
      vehicleUsage,
      supervisorPerformance
    }
  }, [finalFilteredEntries, vehicles, supervisors])

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Vehicle',
      'Supervisor',
      'Shift',
      'Start Time',
      'End Time',
      'Start Mileage',
      'End Mileage',
      'Total Miles',
      'Status',
      'Notes'
    ]
    
    const csvData = finalFilteredEntries.map(entry => [
      entry.date,
      vehicles.find(v => v.id === entry.vehicleId)?.name || 'Unknown',
      entry.supervisorName,
      getShiftLabel(entry.shift),
      formatTime(new Date(entry.startTime)),
      entry.endTime ? formatTime(new Date(entry.endTime)) : 'In Progress',
      entry.startMileage,
      entry.endMileage || 'N/A',
      entry.totalMiles || 'N/A',
      entry.status,
      entry.notes || ''
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `mileage-report-${reportPeriod}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const printReport = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    const printContent = `
      <html>
        <head>
          <title>Security Vehicle Mileage Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
            .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .page-break { page-break-before: always; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Security Vehicle Mileage Report</h1>
            <p>Period: ${reportPeriod.toUpperCase()} | Generated: ${formatDate(new Date())} ${formatTime(new Date())}</p>
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <h3>Total Miles</h3>
              <p style="font-size: 24px; font-weight: bold;">${stats.totalMiles.toLocaleString()}</p>
            </div>
            <div class="stat-card">
              <h3>Completed Shifts</h3>
              <p style="font-size: 24px; font-weight: bold;">${stats.totalShifts}</p>
            </div>
            <div class="stat-card">
              <h3>Average Miles/Shift</h3>
              <p style="font-size: 24px; font-weight: bold;">${stats.avgMilesPerShift.toFixed(1)}</p>
            </div>
            <div class="stat-card">
              <h3>Active Shifts</h3>
              <p style="font-size: 24px; font-weight: bold;">${stats.activeShifts}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Vehicle</th>
                <th>Supervisor</th>
                <th>Shift</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Total Miles</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${finalFilteredEntries.map(entry => `
                <tr>
                  <td>${formatDate(new Date(entry.date))}</td>
                  <td>${vehicles.find(v => v.id === entry.vehicleId)?.name || 'Unknown'}</td>
                  <td>${entry.supervisorName}</td>
                  <td>${getShiftLabel(entry.shift)}</td>
                  <td>${formatTime(new Date(entry.startTime))}</td>
                  <td>${entry.endTime ? formatTime(new Date(entry.endTime)) : 'In Progress'}</td>
                  <td>${entry.totalMiles?.toLocaleString() || 'N/A'}</td>
                  <td>${entry.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `
    
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Reports & Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <label className="text-xs sm:text-sm font-medium mb-2 block">Time Period</label>
              <Select value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value as ReportPeriod)} className="text-sm">
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="all">All Time</option>
              </Select>
            </div>
            
            <div>
              <label className="text-xs sm:text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)} className="text-sm">
                <option value="summary">Summary</option>
                <option value="detailed">Detailed</option>
                <option value="vehicle">By Vehicle</option>
                <option value="supervisor">By Supervisor</option>
              </Select>
            </div>
            
            <div>
              <label className="text-xs sm:text-sm font-medium mb-2 block">Filter by Vehicle</label>
              <Select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} className="text-sm">
                <option value="all">All Vehicles</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>
                ))}
              </Select>
            </div>
            
            <div>
              <label className="text-xs sm:text-sm font-medium mb-2 block">Filter by Supervisor</label>
              <Select value={selectedSupervisor} onChange={(e) => setSelectedSupervisor(e.target.value)} className="text-sm">
                <option value="all">All Supervisors</option>
                {supervisors.map(supervisor => (
                  <option key={supervisor.id} value={supervisor.name}>{supervisor.name}</option>
                ))}
              </Select>
            </div>
            
            <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
              <label className="text-xs sm:text-sm font-medium mb-2 block">Export</label>
              <div className="flex gap-2">
                <Button onClick={exportToCSV} variant="outline" size="sm" className="flex items-center gap-1 sm:gap-2 flex-1 text-xs sm:text-sm">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">CSV</span>
                  <span className="sm:hidden">CSV</span>
                </Button>
                <Button onClick={printReport} variant="outline" size="sm" className="flex items-center gap-1 sm:gap-2 flex-1 text-xs sm:text-sm">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Print</span>
                  <span className="sm:hidden">Print</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Miles", value: stats.totalMiles.toLocaleString(), icon: TrendingUp, color: "text-blue-600" },
          { title: "Completed Shifts", value: stats.totalShifts, icon: Calendar, color: "text-green-600" },
          { title: "Avg Miles/Shift", value: stats.avgMilesPerShift.toFixed(1), icon: BarChart3, color: "text-purple-600" },
          { title: "Active Shifts", value: stats.activeShifts, icon: PieChart, color: "text-orange-600" }
        ].map((stat, index) => (
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
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Shift Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Shift Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">First Shift (5AM - 5PM)</span>
                </div>
                <Badge variant="outline">{stats.firstShifts} shifts</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <span className="font-medium">Second Shift (5PM - 5AM)</span>
                </div>
                <Badge variant="outline">{stats.secondShifts} shifts</Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Shift Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>First Shift Coverage</span>
                  <span>{((stats.firstShifts / (stats.totalShifts || 1)) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(stats.firstShifts / (stats.totalShifts || 1)) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Second Shift Coverage</span>
                  <span>{((stats.secondShifts / (stats.totalShifts || 1)) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${(stats.secondShifts / (stats.totalShifts || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Usage Report */}
      {(reportType === 'summary' || reportType === 'vehicle') && (
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Usage Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Vehicle</th>
                    <th className="text-left p-3">Shifts</th>
                    <th className="text-left p-3">Total Miles</th>
                    <th className="text-left p-3">Avg Miles/Shift</th>
                    <th className="text-left p-3">Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.vehicleUsage.map((vehicle, index) => (
                    <tr key={index} className="border-b hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      <td className="p-3 font-medium">{vehicle.vehicle}</td>
                      <td className="p-3">{vehicle.shifts}</td>
                      <td className="p-3">{vehicle.miles.toLocaleString()}</td>
                      <td className="p-3">{vehicle.shifts > 0 ? (vehicle.miles / vehicle.shifts).toFixed(1) : '0'}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-neutral-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${Math.min((vehicle.shifts / (stats.totalShifts || 1)) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">
                            {((vehicle.shifts / (stats.totalShifts || 1)) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supervisor Performance Report */}
      {(reportType === 'summary' || reportType === 'supervisor') && (
        <Card>
          <CardHeader>
            <CardTitle>Supervisor Performance Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Supervisor</th>
                    <th className="text-left p-3">Shifts</th>
                    <th className="text-left p-3">Total Miles</th>
                    <th className="text-left p-3">Avg Miles/Shift</th>
                    <th className="text-left p-3">Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.supervisorPerformance.map((supervisor, index) => (
                    <tr key={index} className="border-b hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      <td className="p-3 font-medium">{supervisor.supervisor}</td>
                      <td className="p-3">{supervisor.shifts}</td>
                      <td className="p-3">{supervisor.miles.toLocaleString()}</td>
                      <td className="p-3">{supervisor.shifts > 0 ? (supervisor.miles / supervisor.shifts).toFixed(1) : '0'}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-neutral-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${Math.min((supervisor.shifts / (stats.totalShifts || 1)) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">
                            {((supervisor.shifts / (stats.totalShifts || 1)) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Entries */}
      {reportType === 'detailed' && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Shift Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {finalFilteredEntries.length === 0 ? (
                <p className="text-center py-8 text-neutral-500">No entries found for the selected criteria</p>
              ) : (
                finalFilteredEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={entry.status === 'active' ? 'default' : 'success'}>
                          {entry.status}
                        </Badge>
                        <Badge variant="outline">{getShiftLabel(entry.shift)}</Badge>
                      </div>
                      <span className="text-sm text-neutral-500">{formatDate(new Date(entry.date))}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-neutral-500">Vehicle:</span>
                        <p className="font-medium">{vehicles.find(v => v.id === entry.vehicleId)?.name}</p>
                      </div>
                      <div>
                        <span className="text-neutral-500">Supervisor:</span>
                        <p className="font-medium">{entry.supervisorName}</p>
                      </div>
                      <div>
                        <span className="text-neutral-500">Time:</span>
                        <p className="font-medium">
                          {formatTime(new Date(entry.startTime))} - {entry.endTime ? formatTime(new Date(entry.endTime)) : 'Active'}
                        </p>
                      </div>
                      <div>
                        <span className="text-neutral-500">Miles:</span>
                        <p className="font-medium">
                          {entry.totalMiles ? `${entry.totalMiles.toLocaleString()} miles` : 'In Progress'}
                        </p>
                      </div>
                    </div>
                    
                    {entry.notes && (
                      <div className="mt-3 p-2 bg-neutral-50 dark:bg-neutral-800 rounded text-sm">
                        <span className="text-neutral-500">Notes: </span>
                        {entry.notes}
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
