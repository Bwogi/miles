"use client"

import { useState, useEffect } from "react"
import { Dashboard } from "@/components/Dashboard"
import { MileageForm } from "@/components/MileageForm"
import { MileageHistory } from "@/components/MileageHistory"
import { VehicleManagement } from "@/components/VehicleManagement"
import { SupervisorManagement } from "@/components/SupervisorManagement"
import { Reports } from "@/components/Reports"
import { Button } from "@/components/ui/button"
import { MileageEntry, Vehicle, Supervisor } from "@/types"
import { BarChart3, Car, Users, Clock, Settings, FileText } from "lucide-react"

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'mileage' | 'history' | 'vehicles' | 'supervisors' | 'reports'>('dashboard')
  const [mileageEntries, setMileageEntries] = useState<MileageEntry[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('mileageEntries')
    const savedVehicles = localStorage.getItem('vehicles')
    const savedSupervisors = localStorage.getItem('supervisors')

    if (savedEntries) {
      setMileageEntries(JSON.parse(savedEntries))
    }
    if (savedVehicles) {
      setVehicles(JSON.parse(savedVehicles))
    } else {
      // Add default vehicles
      const defaultVehicles: Vehicle[] = [
        { id: '1', name: 'Security Patrol Unit 1', licensePlate: 'SPU-001', isActive: true },
        { id: '2', name: 'Security Patrol Unit 2', licensePlate: 'SPU-002', isActive: true }
      ]
      setVehicles(defaultVehicles)
      localStorage.setItem('vehicles', JSON.stringify(defaultVehicles))
    }
    if (savedSupervisors) {
      setSupervisors(JSON.parse(savedSupervisors))
    } else {
      // Add default supervisors
      const defaultSupervisors: Supervisor[] = [
        { id: '1', name: 'John Smith', badgeNumber: '12345', isActive: true },
        { id: '2', name: 'Sarah Johnson', badgeNumber: '12346', isActive: true }
      ]
      setSupervisors(defaultSupervisors)
      localStorage.setItem('supervisors', JSON.stringify(defaultSupervisors))
    }
  }, [])

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('mileageEntries', JSON.stringify(mileageEntries))
  }, [mileageEntries])

  useEffect(() => {
    localStorage.setItem('vehicles', JSON.stringify(vehicles))
  }, [vehicles])

  useEffect(() => {
    localStorage.setItem('supervisors', JSON.stringify(supervisors))
  }, [supervisors])

  // Mileage entry handlers
  const handleAddMileageEntry = (entry: Omit<MileageEntry, 'id'>) => {
    const newEntry: MileageEntry = {
      ...entry,
      id: Date.now().toString()
    }
    setMileageEntries(prev => [...prev, newEntry])
  }

  const handleEndShift = (entryId: string, endMileage: number, notes?: string) => {
    setMileageEntries(prev => prev.map(entry => {
      if (entry.id === entryId) {
        const totalMiles = endMileage - entry.startMileage
        return {
          ...entry,
          endTime: new Date().toISOString(),
          endMileage,
          totalMiles,
          notes: notes || entry.notes,
          status: 'completed' as const
        }
      }
      return entry
    }))
  }

  const handleDeleteEntry = (entryId: string) => {
    setMileageEntries(prev => prev.filter(entry => entry.id !== entryId))
  }

  // Vehicle handlers
  const handleAddVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: Date.now().toString()
    }
    setVehicles(prev => [...prev, newVehicle])
  }

  const handleUpdateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(vehicle => 
      vehicle.id === id ? { ...vehicle, ...updates } : vehicle
    ))
  }

  const handleDeleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(vehicle => vehicle.id !== id))
  }

  // Supervisor handlers
  const handleAddSupervisor = (supervisor: Omit<Supervisor, 'id'>) => {
    const newSupervisor: Supervisor = {
      ...supervisor,
      id: Date.now().toString()
    }
    setSupervisors(prev => [...prev, newSupervisor])
  }

  const handleUpdateSupervisor = (id: string, updates: Partial<Supervisor>) => {
    setSupervisors(prev => prev.map(supervisor => 
      supervisor.id === id ? { ...supervisor, ...updates } : supervisor
    ))
  }

  const handleDeleteSupervisor = (id: string) => {
    setSupervisors(prev => prev.filter(supervisor => supervisor.id !== id))
  }

  const activeEntry = mileageEntries.find(entry => entry.status === 'active')

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'mileage' as const, label: 'Mileage Entry', icon: Clock },
    { id: 'history' as const, label: 'History', icon: Car },
    { id: 'reports' as const, label: 'Reports', icon: FileText },
    { id: 'vehicles' as const, label: 'Vehicles', icon: Car },
    { id: 'supervisors' as const, label: 'Supervisors', icon: Users }
  ]

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-800 shadow-sm border-b border-neutral-200 dark:border-neutral-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 truncate">
                  Security Vehicle Mile Tracker
                </h1>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 hidden sm:block">
                  Professional mileage logging system
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex space-x-1 sm:space-x-4 lg:space-x-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1 sm:gap-2 whitespace-nowrap py-3 sm:py-4 px-2 sm:px-3 text-xs sm:text-sm flex-shrink-0"
              >
                <tab.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline sm:inline">{tab.label}</span>
                <span className="xs:hidden sm:hidden">{tab.label.split(' ')[0]}</span>
              </Button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {activeTab === 'dashboard' && (
          <Dashboard entries={mileageEntries} vehicles={vehicles} />
        )}
        
        {activeTab === 'mileage' && (
          <MileageForm
            vehicles={vehicles}
            supervisors={supervisors}
            onSubmit={handleAddMileageEntry}
            activeEntry={activeEntry}
            onEndShift={handleEndShift}
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
