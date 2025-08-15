"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { PhotoViewer } from "./PhotoViewer"
import { MileageEntry, Vehicle } from "@/types"
import { formatDate, formatTime, getShiftLabel } from "@/lib/utils"
import { Clock, Car, User, MapPin, FileText, Trash2 } from "lucide-react"
import { motion } from "framer-motion"

interface MileageHistoryProps {
  entries: MileageEntry[]
  vehicles: Vehicle[]
  onDeleteEntry?: (entryId: string) => void
}

export function MileageHistory({ entries, vehicles, onDeleteEntry }: MileageHistoryProps) {
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  )

  // Debug logging for photo data
  console.log('MileageHistory Debug - All entries:', entries.map(entry => ({
    id: entry.id,
    startPhotos: entry.startPhotos,
    endPhotos: entry.endPhotos,
    hasStartPhotos: entry.startPhotos && Object.keys(entry.startPhotos).length > 0,
    hasEndPhotos: entry.endPhotos && Object.keys(entry.endPhotos).length > 0
  })))

  const getVehicleName = (vehicleId: string) => {
    return vehicles.find(v => v.id === vehicleId)?.name || 'Unknown Vehicle'
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'default' : 'success'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-6 w-6" />
          Mileage History
        </CardTitle>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Recent shift records and mileage logs
        </p>
      </CardHeader>

      <CardContent>
        {sortedEntries.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No mileage entries recorded yet</p>
            <p className="text-sm">Start your first shift to see records here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusColor(entry.status)}>
                      {entry.status === 'active' ? 'Active' : 'Completed'}
                    </Badge>
                    <Badge variant="outline">
                      {getShiftLabel(entry.shift)}
                    </Badge>
                  </div>
                  {onDeleteEntry && entry.status === 'completed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteEntry(entry.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-neutral-500" />
                    <div>
                      <p className="text-xs text-neutral-500">Vehicle</p>
                      <p className="font-medium">{getVehicleName(entry.vehicleId)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-neutral-500" />
                    <div>
                      <p className="text-xs text-neutral-500">Supervisor</p>
                      <p className="font-medium">{entry.supervisorName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-neutral-500" />
                    <div>
                      <p className="text-xs text-neutral-500">Date</p>
                      <p className="font-medium">{formatDate(new Date(entry.date))}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-neutral-500" />
                    <div>
                      <p className="text-xs text-neutral-500">Total Miles</p>
                      <p className="font-medium">
                        {entry.totalMiles !== null && entry.totalMiles !== undefined ? `${entry.totalMiles.toLocaleString()} miles` : 'In Progress'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-500">Start Time</p>
                    <p className="font-medium">{formatTime(new Date(entry.startTime))}</p>
                    <p className="text-neutral-500">Start Mileage: {entry.startMileage.toLocaleString()}</p>
                  </div>

                  {entry.endTime && (
                    <div>
                      <p className="text-neutral-500">End Time</p>
                      <p className="font-medium">{formatTime(new Date(entry.endTime))}</p>
                      <p className="text-neutral-500">End Mileage: {entry.endMileage?.toLocaleString()}</p>
                    </div>
                  )}

                  {entry.notes && (
                    <div className="md:col-span-1">
                      <p className="text-neutral-500 flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Notes
                      </p>
                      <p className="text-sm bg-neutral-50 dark:bg-neutral-800 p-2 rounded mt-1">
                        {entry.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Vehicle Photos */}
                <PhotoViewer
                  startPhotos={entry.startPhotos}
                  endPhotos={entry.endPhotos}
                  title="Vehicle Inspection Photos"
                  className="mt-4"
                />
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
