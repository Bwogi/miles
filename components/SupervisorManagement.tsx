"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Supervisor } from "@/types"
import { User, Plus, Edit, Trash2, Shield } from "lucide-react"
import { motion } from "framer-motion"

interface SupervisorManagementProps {
  supervisors: Supervisor[]
  onAddSupervisor: (supervisor: Omit<Supervisor, 'id'>) => void
  onUpdateSupervisor: (id: string, supervisor: Partial<Supervisor>) => void
  onDeleteSupervisor: (id: string) => void
}

export function SupervisorManagement({ supervisors, onAddSupervisor, onUpdateSupervisor, onDeleteSupervisor }: SupervisorManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    badgeNumber: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.badgeNumber) {
      alert('Please fill in all fields')
      return
    }

    if (editingId) {
      onUpdateSupervisor(editingId, {
        name: formData.name,
        badgeNumber: formData.badgeNumber
      })
      setEditingId(null)
    } else {
      onAddSupervisor({
        name: formData.name,
        badgeNumber: formData.badgeNumber,
        isActive: true
      })
      setShowAddForm(false)
    }
    
    setFormData({ name: '', badgeNumber: '' })
  }

  const handleEdit = (supervisor: Supervisor) => {
    setFormData({
      name: supervisor.name,
      badgeNumber: supervisor.badgeNumber
    })
    setEditingId(supervisor.id)
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingId(null)
    setFormData({ name: '', badgeNumber: '' })
  }

  const toggleSupervisorStatus = (id: string, currentStatus: boolean) => {
    onUpdateSupervisor(id, { isActive: !currentStatus })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Supervisor Management
          </CardTitle>
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Supervisor
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg"
          >
            <h3 className="font-semibold mb-4">
              {editingId ? 'Edit Supervisor' : 'Add New Supervisor'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    placeholder="e.g., John Smith"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Badge Number</label>
                  <Input
                    placeholder="e.g., 12345"
                    value={formData.badgeNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, badgeNumber: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? 'Update Supervisor' : 'Add Supervisor'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="space-y-3">
          {supervisors.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No supervisors registered yet</p>
              <p className="text-sm">Add your first supervisor to get started</p>
            </div>
          ) : (
            supervisors.map((supervisor, index) => (
              <motion.div
                key={supervisor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-neutral-500" />
                  <div>
                    <h4 className="font-medium">{supervisor.name}</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Badge #{supervisor.badgeNumber}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={supervisor.isActive ? 'success' : 'secondary'}>
                    {supervisor.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSupervisorStatus(supervisor.id, supervisor.isActive)}
                    className={supervisor.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                  >
                    {supervisor.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(supervisor)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this supervisor?')) {
                        onDeleteSupervisor(supervisor.id)
                      }
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
