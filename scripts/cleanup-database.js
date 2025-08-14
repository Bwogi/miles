#!/usr/bin/env node

/**
 * Database Cleanup Script
 * Clears all mileage entries to start with a clean slate
 * 
 * Usage: node scripts/cleanup-database.js
 */

const { MongoClient } = require('mongodb')
const fs = require('fs')
const path = require('path')

// Load environment variables manually
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local')
    const envContent = fs.readFileSync(envPath, 'utf8')
    const lines = envContent.split('\n')
    
    for (const line of lines) {
      const [key, value] = line.split('=')
      if (key && value) {
        process.env[key.trim()] = value.trim()
      }
    }
  } catch (error) {
    console.error('Could not load .env.local file:', error.message)
    console.log('Please make sure MONGODB_URI is set in your environment')
  }
}

loadEnv()

async function cleanupDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB...')
    
    const db = client.db()
    
    // Delete all mileage entries
    const mileageResult = await db.collection('mileageentries').deleteMany({})
    console.log(`✅ Deleted ${mileageResult.deletedCount} mileage entries`)
    
    // Optionally, you can also clear vehicles and supervisors:
    // const vehicleResult = await db.collection('vehicles').deleteMany({})
    // console.log(`✅ Deleted ${vehicleResult.deletedCount} vehicles`)
    
    // const supervisorResult = await db.collection('supervisors').deleteMany({})
    // console.log(`✅ Deleted ${supervisorResult.deletedCount} supervisors`)
    
    console.log('🎉 Database cleanup completed!')
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  } finally {
    await client.close()
    console.log('Disconnected from MongoDB')
  }
}

// Run the cleanup
cleanupDatabase()
