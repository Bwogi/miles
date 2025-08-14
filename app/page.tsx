"use client"

import { useState, useEffect } from "react"
import { ShiftSelector } from "@/components/ShiftSelector"
import { ActiveShiftDashboard } from "@/components/ActiveShiftDashboard"
import { Dashboard } from "@/components/Dashboard"
import { MileageForm } from "@/components/MileageForm"
import { MileageHistory } from "@/components/MileageHistory"
import { VehicleManagement } from "@/components/VehicleManagement"
import { SupervisorManagement } from "@/components/SupervisorManagement"
import { Reports } from "@/components/Reports"
import { Button } from "@/components/ui/button"
import { useData } from "@/hooks/useData"
import { Vehicle, Supervisor } from "@/types"
import { BarChart3, Car, Users, Clock, Settings, FileText, Loader2, AlertTriangle } from "lucide-react"

export default function Home() {
  const [view, setView] = useState<'selector' | 'active' | 'admin'>('selector')
  const [activeTab, setActiveTab] = useState<'dashboard' | 'mileage' | 'history' | 'vehicles' | 'supervisors' | 'reports'>('dashboard')
  const [allowLogout, setAllowLogout] = useState(false)
  
  const {
    mileageEntries,
    vehicles,
    supervisors,
    loading,
    error,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addSupervisor,
    updateSupervisor,
    deleteSupervisor,
    addMileageEntry,
    deleteMileageEntry,
    endShift
  } = useData()

  // Handler functions that wrap the API calls with error handling
  const handleStartShift = async (data: {
    vehicleId: string
    supervisorName: string
    startMileage: number
  }) => {
    try {
      const now = new Date()
      const shiftData = {
        vehicleId: data.vehicleId,
        supervisorName: data.supervisorName,
        startMileage: data.startMileage,
        shift: 'first' as const, // Will be determined by current time
        date: now.toISOString().split('T')[0],
        startTime: now.toISOString(),
        status: 'active' as const,
        notes: `Shift started`
      }
      await addMileageEntry(shiftData)
      setView('active')
    } catch (error) {
      console.error('Failed to start shift:', error)
      alert('Failed to start shift. Please try again.')
    }
  }

  const handleEndShift = async (endMileage: number, notes?: string) => {
    if (!activeEntry) return
    
    try {
      await endShift(activeEntry.id, endMileage, notes)
      // Allow logout after successful shift completion
      setAllowLogout(true)
      // Automatically return to selector after shift completion
      setTimeout(() => {
        setView('selector')
        setAllowLogout(false)
      }, 500)
    } catch (error) {
      console.error('Failed to end shift:', error)
      alert('Failed to end shift. Please try again.')
    }
  }

  const handleLogout = () => {
    setAllowLogout(true)
    setView('selector')
    // Reset allowLogout after a brief delay to prevent issues
    setTimeout(() => {
      setAllowLogout(false)
    }, 100)
  }

  const handleAdminAccess = () => {
    setView('admin')
  }

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteMileageEntry(entryId)
    } catch (error) {
      console.error('Failed to delete entry:', error)
      alert('Failed to delete entry. Please try again.')
    }
  }

  // Vehicle handlers
  const handleAddVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      await addVehicle(vehicle)
    } catch (error) {
      console.error('Failed to add vehicle:', error)
      alert('Failed to add vehicle. Please try again.')
    }
  }

  const handleUpdateVehicle = async (id: string, vehicle: Partial<Vehicle>) => {
    try {
      await updateVehicle(id, vehicle)
    } catch (error) {
      console.error('Failed to update vehicle:', error)
      alert('Failed to update vehicle. Please try again.')
    }
  }

  const handleDeleteVehicle = async (id: string) => {
    try {
      await deleteVehicle(id)
    } catch (error) {
      console.error('Failed to delete vehicle:', error)
      alert('Failed to delete vehicle. Please try again.')
    }
  }

  // Supervisor handlers
  const handleAddSupervisor = async (supervisor: Omit<Supervisor, 'id'>) => {
    try {
      await addSupervisor(supervisor)
    } catch (error) {
      console.error('Failed to add supervisor:', error)
      alert('Failed to add supervisor. Please try again.')
    }
  }

  const handleUpdateSupervisor = async (id: string, supervisor: Partial<Supervisor>) => {
    try {
      await updateSupervisor(id, supervisor)
    } catch (error) {
      console.error('Failed to update supervisor:', error)
      alert('Failed to update supervisor. Please try again.')
    }
  }

  const handleDeleteSupervisor = async (id: string) => {
    try {
      await deleteSupervisor(id)
    } catch (error) {
      console.error('Failed to delete supervisor:', error)
      alert('Failed to delete supervisor. Please try again.')
    }
  }

  const activeEntry = mileageEntries.find(entry => !entry.endTime)
  const currentVehicle = activeEntry ? vehicles.find(v => v.id === activeEntry.vehicleId) : null
  
  // Debug vehicle lookup issue
  if (activeEntry && !currentVehicle) {
    console.log('Vehicle lookup failed:', {
      activeEntryVehicleId: activeEntry.vehicleId,
      availableVehicleIds: vehicles.map(v => v.id),
      vehicles: vehicles
    })
  }

  // Force users to stay in active shift view if they have an ongoing shift (unless logout is allowed)
  // Only enforce session lock if we have both activeEntry AND currentVehicle (valid data)
  useEffect(() => {
    if (activeEntry && currentVehicle && view !== 'active' && !allowLogout) {
      setView('active')
    }
  }, [activeEntry?.id, currentVehicle?.id, view, allowLogout])

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'mileage' as const, label: 'Mileage Entry', icon: Clock },
    { id: 'history' as const, label: 'History', icon: Car },
    { id: 'reports' as const, label: 'Reports', icon: FileText },
    { id: 'vehicles' as const, label: 'Vehicles', icon: Car },
    { id: 'supervisors' as const, label: 'Supervisors', icon: Users }
  ]

  // Debug logging
  console.log('App state:', { 
    loading, 
    error, 
    vehiclesCount: vehicles.length, 
    entriesCount: mileageEntries.length,
    view,
    activeEntry: !!activeEntry,
    currentVehicle: !!currentVehicle,
    allowLogout,
    activeEntryId: activeEntry?.id,
    currentVehicleId: currentVehicle?.id
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-blue-200">Loading your data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-400" />
          <p className="text-red-400 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Show shift selector if no active shift
  if (view === 'selector') {
    return (
      <div>
        <ShiftSelector
          vehicles={vehicles}
          supervisors={supervisors}
          onStartShift={handleStartShift}
          activeEntry={activeEntry}
        />
        {(!activeEntry || !currentVehicle) && (
          <div className="fixed bottom-4 right-4">
            <Button
              onClick={handleAdminAccess}
              variant="outline"
              className="bg-gray-800/80 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Show active shift dashboard
  if (view === 'active') {
    if (activeEntry && currentVehicle) {
      return (
        <ActiveShiftDashboard
          activeEntry={activeEntry}
          vehicle={currentVehicle}
          onEndShift={handleEndShift}
          onLogout={handleLogout}
        />
      )
    } else {
      // Fallback: if we're in active view but missing data, go back to selector
      console.log('Active view but missing data, returning to selector', { activeEntry: !!activeEntry, currentVehicle: !!currentVehicle })
      setView('selector')
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
            <p className="text-blue-200">Redirecting...</p>
          </div>
        </div>
      )
    }
  }

  // Show admin interface
  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* Header */}
        <header className="bg-white dark:bg-neutral-800 shadow-sm border-b border-neutral-200 dark:border-neutral-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Settings className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    Security Vehicle Mile Tracker - Admin
                  </h1>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Administrative interface {error && '(Offline Mode)'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {error && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="text-sm">Database connection issue</span>
                  </div>
                )}
                <Button
                  onClick={() => setView('selector')}
                  variant="outline"
                  className="border-gray-600 text-gray-700 hover:bg-gray-100"
                >
                  Back to Shift Selector
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 whitespace-nowrap py-4 px-3"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'dashboard' && (
            <Dashboard entries={mileageEntries} vehicles={vehicles} />
          )}
          
          {activeTab === 'mileage' && (
            <MileageForm
              vehicles={vehicles}
              supervisors={supervisors}
              onSubmit={async (data) => {
                try {
                  await addMileageEntry(data)
                } catch (error) {
                  console.error('Failed to add mileage entry:', error)
                  alert('Failed to add mileage entry. Please try again.')
                }
              }}
              activeEntry={activeEntry}
              onEndShift={async (entryId: string, endMileage: number, notes?: string) => {
                try {
                  await endShift(entryId, endMileage, notes)
                } catch (error) {
                  console.error('Failed to end shift:', error)
                  alert('Failed to end shift. Please try again.')
                }
              }}
            />
          )}
          
          {activeTab === 'history' && (
            <MileageHistory
              entries={mileageEntries}
              vehicles={vehicles}
              onDeleteEntry={handleDeleteEntry}
            />
          )}
          
          {activeTab === 'reports' && (
            <Reports
              entries={mileageEntries}
              vehicles={vehicles}
              supervisors={supervisors}
            />
          )}
          
          {activeTab === 'vehicles' && (
            <VehicleManagement
              vehicles={vehicles}
              onAddVehicle={handleAddVehicle}
              onUpdateVehicle={handleUpdateVehicle}
              onDeleteVehicle={handleDeleteVehicle}
            />
          )}
          
          {activeTab === 'supervisors' && (
            <SupervisorManagement
              supervisors={supervisors}
              onAddSupervisor={handleAddSupervisor}
              onUpdateSupervisor={handleUpdateSupervisor}
              onDeleteSupervisor={handleDeleteSupervisor}
            />
          )}
        </main>
      </div>
    )
  }

  // Fallback - should not reach here
  return null
}
