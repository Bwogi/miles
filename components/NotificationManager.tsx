"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
// import { Textarea } from "./ui/textarea" // Not available, using standard textarea
import { Vehicle, Supervisor } from "@/types"
import { Bell, Send, Users, Car, AlertTriangle, Clock, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { SecurityNotifications, NotificationTemplates, sendLocalNotification } from "@/lib/notifications"

interface NotificationManagerProps {
  vehicles: Vehicle[]
  supervisors: Supervisor[]
}

export function NotificationManager({ vehicles, supervisors }: NotificationManagerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [customTitle, setCustomTitle] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [targetType, setTargetType] = useState<'all' | 'supervisor' | 'vehicle'>('all')
  const [targetId, setTargetId] = useState('')
  const [sending, setSending] = useState(false)
  const [lastSent, setLastSent] = useState<string | null>(null)

  const notificationTemplates = [
    {
      id: 'shift-reminder',
      name: 'Shift Reminder',
      description: 'Remind supervisors about upcoming shift',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'end-shift',
      name: 'End Shift Reminder',
      description: 'Remind to complete shift and log mileage',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'missing-mileage',
      name: 'Missing Mileage',
      description: 'Alert about missing mileage entries',
      icon: Car,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'vehicle-condition',
      name: 'Vehicle Inspection',
      description: 'Remind to check vehicle condition',
      icon: Car,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'emergency',
      name: 'Emergency Alert',
      description: 'Send urgent emergency notification',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 'custom',
      name: 'Custom Message',
      description: 'Send a custom notification',
      icon: Bell,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ]

  const handleSendNotification = async () => {
    if (!selectedTemplate && !customTitle) {
      alert('Please select a template or enter a custom title')
      return
    }

    // Request notification permission first
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        alert('Please allow notifications to send alerts to your device')
        return
      }
    } else {
      alert('This browser does not support notifications')
      return
    }

    setSending(true)
    
    try {
      let notification
      
      if (selectedTemplate === 'custom') {
        if (!customTitle || !customMessage) {
          alert('Please enter both title and message for custom notification')
          setSending(false)
          return
        }
        
        notification = {
          title: customTitle,
          body: customMessage,
          tag: 'custom'
        }
      } else {
        // Use predefined templates
        switch (selectedTemplate) {
          case 'shift-reminder':
            const supervisorName = targetType === 'supervisor' && targetId 
              ? supervisors.find(s => s.id === targetId)?.name || 'Supervisor'
              : 'Supervisor'
            notification = NotificationTemplates.shiftReminder(supervisorName)
            break
          case 'end-shift':
            const vehicleName = targetType === 'vehicle' && targetId
              ? vehicles.find(v => v.id === targetId)?.name || 'Vehicle'
              : 'Vehicle'
            notification = NotificationTemplates.endShiftReminder(vehicleName)
            break
          case 'missing-mileage':
            const today = new Date().toLocaleDateString()
            notification = NotificationTemplates.missingMileage(today)
            break
          case 'vehicle-condition':
            const inspectionVehicle = targetType === 'vehicle' && targetId
              ? vehicles.find(v => v.id === targetId)?.name || 'Vehicle'
              : 'Vehicle'
            notification = NotificationTemplates.vehicleCondition(inspectionVehicle)
            break
          case 'emergency':
            notification = NotificationTemplates.emergencyAlert(customMessage || 'Emergency situation - please respond immediately')
            break
          default:
            throw new Error('Invalid template selected')
        }
      }

      // Send the notification using the proper method
      await sendLocalNotification(notification)
      
      setLastSent(`${notification.title} sent to ${targetType === 'all' ? 'all users' : targetType}`)
      
      // Reset form
      setSelectedTemplate('')
      setCustomTitle('')
      setCustomMessage('')
      setTargetType('all')
      setTargetId('')
      
    } catch (error) {
      console.error('Failed to send notification:', error)
      alert('Failed to send notification. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Notification Manager
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Send notifications to security supervisors and manage alerts
        </p>
      </div>

      {/* Success Message */}
      {lastSent && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">{lastSent}</span>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notificationTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${template.bgColor}`}>
                      <template.icon className={`h-4 w-4 ${template.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notification Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Send Notification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Target Selection */}
            <div>
              <label className="text-sm font-medium">Send To</label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as 'all' | 'supervisor' | 'vehicle')}
                className="w-full mt-1 p-2 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900"
              >
                <option value="all">All Supervisors</option>
                <option value="supervisor">Specific Supervisor</option>
                <option value="vehicle">Vehicle Operators</option>
              </select>
            </div>

            {/* Specific Target Selection */}
            {targetType === 'supervisor' && (
              <div>
                <label className="text-sm font-medium">Select Supervisor</label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full mt-1 p-2 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900"
                >
                  <option value="">Choose supervisor...</option>
                  {supervisors.filter(s => s.isActive).map((supervisor) => (
                    <option key={supervisor.id} value={supervisor.id}>
                      {supervisor.name} (Badge: {supervisor.badgeNumber})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {targetType === 'vehicle' && (
              <div>
                <label className="text-sm font-medium">Select Vehicle</label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full mt-1 p-2 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900"
                >
                  <option value="">Choose vehicle...</option>
                  {vehicles.filter(v => v.isActive).map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.licensePlate})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Message Fields */}
            {selectedTemplate === 'custom' && (
              <>
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Enter notification title"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <textarea
                    placeholder="Enter notification message"
                    value={customMessage}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomMessage(e.target.value)}
                    rows={3}
                    className="w-full mt-1 p-2 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 resize-none"
                  />
                </div>
              </>
            )}

            {/* Emergency Message Field */}
            {selectedTemplate === 'emergency' && (
              <div>
                <label className="text-sm font-medium">Emergency Message</label>
                <textarea
                  placeholder="Enter emergency details"
                  value={customMessage}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomMessage(e.target.value)}
                  rows={3}
                  className="w-full mt-1 p-2 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 resize-none"
                />
              </div>
            )}

            {/* Send Button */}
            <Button
              onClick={handleSendNotification}
              disabled={sending || !selectedTemplate}
              className="w-full flex items-center gap-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Notification
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await sendLocalNotification({
                    title: '🔔 Test Notification',
                    body: 'This is a test notification to verify the system is working!',
                    tag: 'test'
                  })
                  setLastSent('Test notification sent successfully')
                } catch (error) {
                  alert('Test notification failed. Check browser permissions.')
                }
              }}
              className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Bell className="h-4 w-4" />
              Test Notification
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTemplate('shift-reminder')
                setTargetType('all')
              }}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Shift Reminder (All)
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTemplate('missing-mileage')
                setTargetType('all')
              }}
              className="flex items-center gap-2"
            >
              <Car className="h-4 w-4" />
              Missing Mileage Alert
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTemplate('emergency')
                setTargetType('all')
              }}
              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <AlertTriangle className="h-4 w-4" />
              Emergency Alert
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
