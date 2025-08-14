import { useState, useEffect } from 'react'
import { MileageEntry, Vehicle, Supervisor } from '@/types'
import { vehicleAPI, supervisorAPI, mileageAPI } from '@/lib/api'

export function useData() {
  const [mileageEntries, setMileageEntries] = useState<MileageEntry[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Load data from database
        await Promise.all([
          fetchVehicles(),
          fetchSupervisors(), 
          fetchMileageEntries()
        ])
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Database connection failed. Please check your connection.')
      } finally {
        setLoading(false)
      }
    }

    const fetchVehicles = async () => {
      try {
        const vehiclesData = await vehicleAPI.getAll().catch(() => [])
        setVehicles(vehiclesData)
      } catch (err) {
        console.error('Error fetching vehicles:', err)
      }
    }

    const fetchSupervisors = async () => {
      try {
        const supervisorsData = await supervisorAPI.getAll().catch(() => [])
        setSupervisors(supervisorsData)
      } catch (err) {
        console.error('Error fetching supervisors:', err)
      }
    }

    const fetchMileageEntries = async () => {
      try {
        const entriesData = await mileageAPI.getAll().catch(() => [])
        setMileageEntries(entriesData)
      } catch (err) {
        console.error('Error fetching mileage entries:', err)
      }
    }

    loadData()
  }, [])





  // Vehicle operations
  const addVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      const newVehicle = await vehicleAPI.create(vehicle)
      setVehicles(prev => [...prev, newVehicle])
      return newVehicle
    } catch (err) {
      console.error('Error adding vehicle:', err)
      throw err
    }
  }

  const updateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    try {
      const updatedVehicle = await vehicleAPI.update(id, updates)
      setVehicles(prev => prev.map(v => v.id === id ? updatedVehicle : v))
      return updatedVehicle
    } catch (err) {
      console.error('Error updating vehicle:', err)
      throw err
    }
  }

  const deleteVehicle = async (id: string) => {
    try {
      await vehicleAPI.delete(id)
      setVehicles(prev => prev.filter(v => v.id !== id))
    } catch (err) {
      console.error('Error deleting vehicle:', err)
      throw err
    }
  }

  // Supervisor operations
  const addSupervisor = async (supervisor: Omit<Supervisor, 'id'>) => {
    try {
      const newSupervisor = await supervisorAPI.create(supervisor)
      setSupervisors(prev => [...prev, newSupervisor])
      return newSupervisor
    } catch (err) {
      console.error('Error adding supervisor:', err)
      throw err
    }
  }

  const updateSupervisor = async (id: string, updates: Partial<Supervisor>) => {
    try {
      const updatedSupervisor = await supervisorAPI.update(id, updates)
      setSupervisors(prev => prev.map(s => s.id === id ? updatedSupervisor : s))
      return updatedSupervisor
    } catch (err) {
      console.error('Error updating supervisor:', err)
      throw err
    }
  }

  const deleteSupervisor = async (id: string) => {
    try {
      await supervisorAPI.delete(id)
      setSupervisors(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      console.error('Error deleting supervisor:', err)
      throw err
    }
  }

  // Mileage entry operations
  const addMileageEntry = async (entry: Omit<MileageEntry, 'id'>) => {
    try {
      const newEntry = await mileageAPI.create(entry)
      setMileageEntries(prev => [...prev, newEntry])
      return newEntry
    } catch (err) {
      console.error('Error adding mileage entry:', err)
      throw err
    }
  }

  const updateMileageEntry = async (id: string, updates: Partial<MileageEntry>) => {
    try {
      const updatedEntry = await mileageAPI.update(id, updates)
      setMileageEntries(prev => prev.map(e => e.id === id ? updatedEntry : e))
      return updatedEntry
    } catch (err) {
      console.error('Error updating mileage entry:', err)
      throw err
    }
  }

  const deleteMileageEntry = async (id: string) => {
    try {
      await mileageAPI.delete(id)
      setMileageEntries(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      console.error('Error deleting mileage entry:', err)
      throw err
    }
  }

  const endShift = async (entryId: string, endMileage: number, notes?: string) => {
    const entry = mileageEntries.find(e => e.id === entryId)
    if (!entry) throw new Error('Entry not found')

    const totalMiles = endMileage - entry.startMileage
    const updates = {
      endTime: new Date().toISOString(),
      endMileage,
      totalMiles,
      notes: notes || entry.notes,
      status: 'completed' as const
    }

    return updateMileageEntry(entryId, updates)
  }

  return {
    // Data
    mileageEntries,
    vehicles,
    supervisors,
    loading,
    error,

    // Vehicle operations
    addVehicle,
    updateVehicle,
    deleteVehicle,

    // Supervisor operations
    addSupervisor,
    updateSupervisor,
    deleteSupervisor,

    // Mileage entry operations
    addMileageEntry,
    updateMileageEntry,
    deleteMileageEntry,
    endShift
  }
}
