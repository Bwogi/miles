"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { VehiclePhotos } from "@/types"
import { Camera, X, ZoomIn, Download, Eye, EyeOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PhotoViewerProps {
  startPhotos?: VehiclePhotos
  endPhotos?: VehiclePhotos
  title: string
  className?: string
}

const PHOTO_POSITIONS = [
  { key: 'front' as keyof VehiclePhotos, label: 'Front View', icon: '🚗' },
  { key: 'back' as keyof VehiclePhotos, label: 'Back View', icon: '🚙' },
  { key: 'leftSide' as keyof VehiclePhotos, label: 'Left Side', icon: '🚐' },
  { key: 'rightSide' as keyof VehiclePhotos, label: 'Right Side', icon: '🚚' },
  { key: 'frontInterior' as keyof VehiclePhotos, label: 'Front Interior', icon: '🪑' },
  { key: 'backInterior' as keyof VehiclePhotos, label: 'Back Interior', icon: '💺' }
]

export function PhotoViewer({ startPhotos, endPhotos, title, className = "" }: PhotoViewerProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<{ src: string; label: string; type: 'start' | 'end' } | null>(null)
  const [showPhotos, setShowPhotos] = useState(false)

  const hasStartPhotos = startPhotos && Object.keys(startPhotos).length > 0
  const hasEndPhotos = endPhotos && Object.keys(endPhotos).length > 0
  const hasAnyPhotos = hasStartPhotos || hasEndPhotos

  const downloadPhoto = (src: string, filename: string) => {
    const link = document.createElement('a')
    link.href = src
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!hasAnyPhotos) {
    return (
      <div className={`text-center py-4 text-gray-500 ${className}`}>
        <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No photos available for this shift</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <Card className="bg-gray-900/90 backdrop-blur-lg border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              {title}
            </div>
            <div className="flex items-center gap-2">
              {hasStartPhotos && (
                <Badge variant="secondary" className="text-xs">
                  {Object.keys(startPhotos).length} Start Photos
                </Badge>
              )}
              {hasEndPhotos && (
                <Badge variant="secondary" className="text-xs">
                  {Object.keys(endPhotos).length} End Photos
                </Badge>
              )}
              <Button
                onClick={() => setShowPhotos(!showPhotos)}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                {showPhotos ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPhotos ? 'Hide' : 'Show'} Photos
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <AnimatePresence>
          {showPhotos && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="space-y-6">
                {/* Start Photos */}
                {hasStartPhotos && (
                  <div>
                    <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Pre-Shift Photos
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {PHOTO_POSITIONS.map((position) => {
                        const photo = startPhotos[position.key]
                        if (!photo) return null
                        
                        return (
                          <motion.div
                            key={`start-${position.key}`}
                            whileHover={{ scale: 1.05 }}
                            className="relative group cursor-pointer"
                            onClick={() => setSelectedPhoto({ 
                              src: photo, 
                              label: `Start - ${position.label}`, 
                              type: 'start' 
                            })}
                          >
                            <img
                              src={photo}
                              alt={`Start ${position.label}`}
                              className="w-full h-20 object-cover rounded-lg border border-green-500/30"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <ZoomIn className="h-5 w-5 text-white" />
                            </div>
                            <div className="absolute bottom-1 left-1 right-1">
                              <div className="bg-black/70 text-white text-xs px-1 py-0.5 rounded text-center">
                                {position.icon} {position.label}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* End Photos */}
                {hasEndPhotos && (
                  <div>
                    <h4 className="text-red-400 font-medium mb-3 flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Post-Shift Photos
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {PHOTO_POSITIONS.map((position) => {
                        const photo = endPhotos[position.key]
                        if (!photo) return null
                        
                        return (
                          <motion.div
                            key={`end-${position.key}`}
                            whileHover={{ scale: 1.05 }}
                            className="relative group cursor-pointer"
                            onClick={() => setSelectedPhoto({ 
                              src: photo, 
                              label: `End - ${position.label}`, 
                              type: 'end' 
                            })}
                          >
                            <img
                              src={photo}
                              alt={`End ${position.label}`}
                              className="w-full h-20 object-cover rounded-lg border border-red-500/30"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <ZoomIn className="h-5 w-5 text-white" />
                            </div>
                            <div className="absolute bottom-1 left-1 right-1">
                              <div className="bg-black/70 text-white text-xs px-1 py-0.5 rounded text-center">
                                {position.icon} {position.label}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.label}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              
              {/* Photo Controls */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedPhoto.type === 'start' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-red-600 text-white'
                }`}>
                  {selectedPhoto.label}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => downloadPhoto(selectedPhoto.src, `${selectedPhoto.label}.jpg`)}
                    variant="outline"
                    size="sm"
                    className="bg-black/50 border-white/20 text-white hover:bg-white/10"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setSelectedPhoto(null)}
                    variant="outline"
                    size="sm"
                    className="bg-black/50 border-white/20 text-white hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
