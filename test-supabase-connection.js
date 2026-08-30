// Test script untuk koneksi Supabase
// Jalankan dengan: node test-supabase-connection.js

// Load environment variables dari .env.local
const fs = require('fs')
const path = require('path')

// Try multiple possible paths
const possiblePaths = [
  path.join(__dirname, '.env.local'),
  path.join(__dirname, 'env.local'),
  '.env.local',
  'env.local'
]

let envPath = null
for (const possiblePath of possiblePaths) {
  if (fs.existsSync(possiblePath)) {
    envPath = possiblePath
    break
  }
}

console.log('Looking for env file, found at:', envPath)

if (envPath) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  console.log('Env file content length:', envContent.length)
  console.log('First 100 chars:', envContent.substring(0, 100))
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        process.env[key.trim()] = value
        console.log(`Loaded: ${key.substring(0, 20)}... = ${value.substring(0, 20)}...`)
      }
    }
  })
}

const { createClient } = require('@supabase/supabase-js')
const ws = require('ws')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('=== Testing Supabase Connection ===')
console.log('URL:', supabaseUrl)
console.log('Key exists:', !!supabaseKey)
console.log('Key length:', supabaseKey?.length || 0)

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Environment variables tidak terbaca!')
  console.log('Pastikan file .env.local ada dan berisi:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=...')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=...')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'Connection': 'keep-alive'
    }
  }
})

async function testConnection() {
  try {
    console.log('\n🔄 Testing connection to Supabase...')
    
    // Test sederhana: cek apakah bisa connect
    const { data, error } = await supabase
      .from('labs')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      console.error('Error details:', error)
      process.exit(1)
    }
    
    console.log('✅ Connection successful!')
    console.log('📊 Test query berhasil dijalankan')
    
    // Test ambil data labs
    console.log('\n🔄 Testing fetch labs...')
    const { data: labs, error: labsError } = await supabase
      .from('labs')
      .select('*')
      .limit(5)
    
    if (labsError) {
      console.error('❌ Fetch labs failed:', labsError.message)
      process.exit(1)
    }
    
    console.log('✅ Fetch labs successful!')
    console.log(`📊 Found ${labs.length} labs`)
    if (labs.length > 0) {
      console.log('Sample lab:', labs[0])
    }
    
  } catch (error) {
    console.error('❌ Exception:', error.message)
    process.exit(1)
  }
}

testConnection()
