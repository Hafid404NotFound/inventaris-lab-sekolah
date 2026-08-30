'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Package, MapPin, AlertTriangle, CheckCircle, FlaskConical, Building2, ArrowLeft } from 'lucide-react'

export default function PublicItemPage() {
  const params = useParams()
  const itemId = params.id as string
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Mock data - in production this would fetch from Supabase
    const mockItems: any = {
      '1': {
        id: '1',
        name: 'Mikroskop Binokuler',
        code: 'KIM-001',
        type: 'alat',
        available_qty: 12,
        total_qty: 15,
        unit: 'pcs',
        condition: 'baik',
        location_rack: 'Rak A-1',
        lab_name: 'Lab Kimia',
        school_name: 'SMA Negeri 1 Jakarta',
        specs_detail: 'Mikroskop binokuler 1000x dengan lampu LED, lensa achromatic, pembesaran 40x-1000x',
        sop: '1. Gunakan dengan hati-hati\n2. Bersihkan lensa setelah penggunaan dengan kain khusus\n3. Simpan di tempat kering dan bebas debu\n4. Jangan gunakan cairan pembersih yang mengandung alkohol',
        last_maintenance: '2025-01-10',
        category: 'Peralatan Glass'
      },
      '2': {
        id: '2',
        name: 'Asam Sulfat',
        code: 'KIM-003',
        type: 'bahan',
        available_qty: 500,
        total_qty: 2000,
        unit: 'ml',
        condition: 'baik',
        location_rack: 'Lemari B3',
        lab_name: 'Lab Kimia',
        school_name: 'SMA Negeri 1 Jakarta',
        specs_detail: 'Asam sulfat 98%, konsentrasi tinggi, grade laboratorium',
        sop: '1. WAJIB gunakan APD (kacamata pelindung, sarung tangan, lab coat)\n2. Selalu tambahkan asam ke air, bukan sebaliknya\n3. Simpan di lemari asam khusus\n4. Jauhkan dari bahan organik',
        expired_date: '2025-12-31',
        category: 'Bahan Kimia'
      },
      '3': {
        id: '3',
        name: 'Multimeter Digital',
        code: 'FIS-001',
        type: 'alat',
        available_qty: 18,
        total_qty: 20,
        unit: 'pcs',
        condition: 'baik',
        location_rack: 'Rak C-1',
        lab_name: 'Lab Fisika',
        school_name: 'SMA Negeri 1 Jakarta',
        specs_detail: 'Multimeter digital dengan fungsi AC/DC, resistance, continuity, dan diode test',
        sop: '1. Pastikan dalam mode pengukuran yang benar\n2. Jangan gunakan untuk tegangan lebih dari 1000V\n3. Kalibrasi secara berkala (setiap 6 bulan)\n4. Gunakan probe yang sesuai',
        last_calibration: '2025-01-05',
        category: 'Alat Listrik'
      }
    }

    setTimeout(() => {
      const foundItem = mockItems[itemId]
      if (foundItem) {
        setItem(foundItem)
        setError('')
      } else {
        setError('Item tidak ditemukan')
      }
      setLoading(false)
    }, 500)
  }, [itemId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Item Tidak Ditemukan</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            Kembali
          </button>
        </div>
      </div>
    )
  }

  const stockPercentage = (item.available_qty / item.total_qty) * 100
  const stockStatus = stockPercentage > 50 ? 'Tersedia' : stockPercentage > 20 ? 'Menipis' : 'Kritis'
  const stockColor = stockPercentage > 50 ? 'text-green-600' : stockPercentage > 20 ? 'text-amber-600' : 'text-red-600'

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-slate-800">Detail Item</h1>
            <p className="text-sm text-slate-600">Informasi Barang Laboratorium</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* School & Lab Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-semibold text-slate-800">{item.school_name}</p>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FlaskConical className="w-4 h-4" />
                <span>{item.lab_name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Item Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-xl ${item.type === 'alat' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                <Package className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-800">{item.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="font-mono text-sm bg-slate-100 px-3 py-1 rounded-full text-slate-700">
                    {item.code}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.type === 'alat' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-sm text-slate-600">{item.category}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Stok Tersedia</p>
              <p className="text-2xl font-bold text-slate-800">
                {item.available_qty} <span className="text-sm font-normal text-slate-500">/ {item.total_qty} {item.unit}</span>
              </p>
              <p className={`text-sm font-medium ${stockColor} mt-1`}>{stockStatus}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Kondisi</p>
              <p className="text-lg font-semibold text-emerald-600 capitalize">
                {item.condition.replace('_', ' ')}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Lokasi</p>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-500" />
                <p className="font-medium text-slate-800">{item.location_rack}</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Status</p>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <p className="font-medium text-emerald-600">Tersedia</p>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="font-semibold text-slate-800 mb-4">Spesifikasi</h3>
          <p className="text-slate-600 leading-relaxed">{item.specs_detail}</p>
        </div>

        {/* SOP */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="font-semibold text-slate-800 mb-4">SOP Pemakaian</h3>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-blue-800 whitespace-pre-line leading-relaxed">{item.sop}</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="font-semibold text-slate-800 mb-4">Informasi Tambahan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {item.last_maintenance && (
              <div>
                <p className="text-sm text-slate-600">Terakhir Maintenance</p>
                <p className="font-medium text-slate-800">{item.last_maintenance}</p>
              </div>
            )}
            {item.last_calibration && (
              <div>
                <p className="text-sm text-slate-600">Terakhir Kalibrasi</p>
                <p className="font-medium text-slate-800">{item.last_calibration}</p>
              </div>
            )}
            {item.expired_date && (
              <div>
                <p className="text-sm text-slate-600">Tanggal Kadaluarsa</p>
                <p className="font-medium text-slate-800">{item.expired_date}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Aksi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => window.location.href = '/dashboard/scan'}
              className="bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition font-medium flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span>Scan Item Lain</span>
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: item.name,
                    text: `${item.name} (${item.code}) - ${item.lab_name}`,
                    url: window.location.href
                  })
                } else {
                  navigator.clipboard.writeText(window.location.href)
                  alert('Link berhasil disalin!')
                }
              }}
              className="border border-slate-300 py-3 rounded-lg hover:bg-slate-50 transition font-medium"
            >
              Bagikan Informasi
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>Scan QR Code untuk informasi real-time</p>
          <p className="mt-1">© 2025 LabKu - Sistem Manajemen Lab Sekolah</p>
        </div>
      </div>
    </div>
  )
}