import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrentShift(): 'first' | 'second' {
  const now = new Date()
  const hour = now.getHours()
  
  // First shift: 5am - 5pm (5-17)
  // Second shift: 5pm - 5am (17-5)
  return hour >= 5 && hour < 17 ? 'first' : 'second'
}

export function getShiftLabel(shift: 'first' | 'second'): string {
  return shift === 'first' ? 'First Shift (5AM - 5PM)' : 'Second Shift (5PM - 5AM)'
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}
