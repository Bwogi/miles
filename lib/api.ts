import { MileageEntry, Vehicle, Supervisor } from "@/types"

const API_BASE = '/api'

// Generic API function
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'API request failed')
  }

  return data.data
}

// Vehicle API functions
export const vehicleAPI = {
  getAll: (): Promise<Vehicle[]> => apiCall('/vehicles'),
  
  create: (vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> =>
    apiCall('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle),
    }),
  
  update: (id: string, updates: Partial<Vehicle>): Promise<Vehicle> =>
    apiCall(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  
  delete: (id: string): Promise<Vehicle> =>
    apiCall(`/vehicles/${id}`, {
      method: 'DELETE',
    }),
}

// Supervisor API functions
export const supervisorAPI = {
  getAll: (): Promise<Supervisor[]> => apiCall('/supervisors'),
  
  create: (supervisor: Omit<Supervisor, 'id'>): Promise<Supervisor> =>
    apiCall('/supervisors', {
      method: 'POST',
      body: JSON.stringify(supervisor),
    }),
  
  update: (id: string, updates: Partial<Supervisor>): Promise<Supervisor> =>
    apiCall(`/supervisors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  
  delete: (id: string): Promise<Supervisor> =>
    apiCall(`/supervisors/${id}`, {
      method: 'DELETE',
    }),
}

// Mileage Entry API functions
export const mileageAPI = {
  getAll: (): Promise<MileageEntry[]> => apiCall('/mileage-entries'),
  
  create: (entry: Omit<MileageEntry, 'id'>): Promise<MileageEntry> =>
    apiCall('/mileage-entries', {
      method: 'POST',
      body: JSON.stringify(entry),
    }),
  
  update: (id: string, updates: Partial<MileageEntry>): Promise<MileageEntry> =>
    apiCall(`/mileage-entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  
  delete: (id: string): Promise<MileageEntry> =>
    apiCall(`/mileage-entries/${id}`, {
      method: 'DELETE',
    }),
}
