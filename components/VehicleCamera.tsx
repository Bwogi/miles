"use client"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { VehiclePhotos } from "@/types"
import { Camera, Check, RotateCcw, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface VehicleCameraProps {
  photos: VehiclePhotos
  onPhotosChange: (photos: VehiclePhotos) => void
  title: string
  isRequired?: boolean
}

const PHOTO_POSITIONS = [
  { key: 'front' as keyof VehiclePhotos, label: 'Front View', icon: '🚗' },
  { key: 'back' as keyof VehiclePhotos, label: 'Back View', icon: '🚙' },
  { key: 'leftSide' as keyof VehiclePhotos, label: 'Left Side', icon: '🚐' },
  { key: 'rightSide' as keyof VehiclePhotos, label: 'Right Side', icon: '🚚' },
  { key: 'frontInterior' as keyof VehiclePhotos, label: 'Front Interior', icon: '🪑' },
  { key: 'backInterior' as keyof VehiclePhotos, label: 'Back Interior', icon: '💺' }
]

export function VehicleCamera({ photos, onPhotosChange, title, isRequired = false }: VehicleCameraProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [currentPosition, setCurrentPosition] = useState<keyof VehiclePhotos | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = useCallback(async (position: keyof VehiclePhotos) => {
    try {
      setCurrentPosition(position)
      setIsCapturing(true)
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please check permissions.')
      setIsCapturing(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCapturing(false)
    setCurrentPosition(null)
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !currentPosition) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64 data URL
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8)

    // Update photos
    const updatedPhotos = {
      ...photos,
      [currentPosition]: photoDataUrl
    }
    onPhotosChange(updatedPhotos)

    // Stop camera
    stopCamera()
  }, [currentPosition, photos, onPhotosChange, stopCamera])

  const deletePhoto = useCallback((position: keyof VehiclePhotos) => {
    const updatedPhotos = { ...photos }
    delete updatedPhotos[position]
    onPhotosChange(updatedPhotos)
  }, [photos, onPhotosChange])

  const completedPhotos = PHOTO_POSITIONS.filter(pos => photos[pos.key]).length
  const totalPhotos = PHOTO_POSITIONS.length
  const allPhotosComplete = completedPhotos === totalPhotos

  return (
    <Card className="bg-gray-900/90 backdrop-blur-lg border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {title}
            {isRequired && <Badge variant="destructive" className="text-xs">Required</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={allPhotosComplete ? "default" : "secondary"} className="text-xs">
              {completedPhotos}/{totalPhotos} Photos
            </Badge>
            {allPhotosComplete && <Check className="h-4 w-4 text-green-400" />}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera View */}
        <AnimatePresence>
          {isCapturing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-black rounded-lg overflow-hidden"
            >
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Camera Controls */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <Button
                  onClick={capturePhoto}
                  className="bg-white text-black hover:bg-gray-200 rounded-full w-16 h-16"
                >
                  <Camera className="h-6 w-6" />
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 rounded-full w-12 h-12"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Position Label */}
              <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {PHOTO_POSITIONS.find(p => p.key === currentPosition)?.label}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 gap-4">
          {PHOTO_POSITIONS.map((position) => {
            const hasPhoto = photos[position.key]
            
            return (
              <motion.div
                key={position.key}
                whileHover={{ scale: 1.02 }}
                className={`relative border-2 border-dashed rounded-lg p-4 transition-all ${
                  hasPhoto 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                }`}
              >
                {hasPhoto ? (
                  <>
                    <img
                      src={photos[position.key]}
                      alt={position.label}
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-green-300">{position.label}</span>
                      </div>
                      <Button
                        onClick={() => deletePhoto(position.key)}
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-400 hover:bg-red-600/10 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="text-2xl mb-2">{position.icon}</div>
                    <div className="text-sm text-gray-400 mb-3">{position.label}</div>
                    <Button
                      onClick={() => startCamera(position.key)}
                      disabled={isCapturing}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Progress Indicator */}
        <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${(completedPhotos / totalPhotos) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-400 text-center">
          {allPhotosComplete ? (
            <span className="text-green-400">✓ All vehicle inspection photos completed</span>
          ) : (
            <span>Take photos of all 6 vehicle positions to complete inspection</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
