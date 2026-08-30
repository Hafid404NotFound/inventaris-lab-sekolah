// Simple test untuk koneksi Supabase tanpa WebSocket
// Jalankan dengan: node test-simple-connection.js

const fs = require('fs')
const path = require('path')

// Load environment variables
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

console.log('=== Simple Supabase Connection Test ===')
console.log('Env file found at:', envPath)

if (envPath) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=')
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim()
      }
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('URL:', supabaseUrl)
console.log('Key exists:', !!supabaseKey)
console.log('Key length:', supabaseKey?.length || 0)

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Environment variables tidak terbaca!')
  process.exit(1)
}

// Test HTTP connection sederhana
async function testHTTPConnection() {
  try {
    console.log('\n🔄 Testing HTTP connection to Supabase...')
    
    const testUrl = `${supabaseUrl}/rest/v1/labs?select=*&limit=1`
    console.log('Test URL:', testUrl)
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Response status:', response.status)
    console.log('Response OK:', response.ok)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ HTTP Connection successful!')
      console.log('📊 Response data:', data)
      
      if (Array.isArray(data)) {
        console.log(`📊 Found ${data.length} labs`)
        if (data.length > 0) {
          console.log('Sample lab:', data[0])
        }
      }
    } else {
      const errorText = await response.text()
      console.error('❌ HTTP Connection failed:', response.status)
      console.error('Error response:', errorText)
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Exception:', error.message)
    process.exit(1)
  }
}

testHTTPConnection()
