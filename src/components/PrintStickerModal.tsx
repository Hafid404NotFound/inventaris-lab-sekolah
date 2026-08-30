'use client'

import { useState } from 'react'
import { Item } from '@/types/database'
import ItemSticker from './ItemSticker'
import { X, Printer, Download } from 'lucide-react'

interface PrintStickerModalProps {
  item: Item
  schoolName: string
  labName: string
  onClose: () => void
}

export default function PrintStickerModal({ item, schoolName, labName, onClose }: PrintStickerModalProps) {
  const [copies, setCopies] = useState(1)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Cetak Label QR</h2>
            <p className="text-sm text-slate-600">{item.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Jumlah:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={copies}
              onChange={(e) => setCopies(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-16 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak</span>
          </button>
        </div>

        {/* Print Preview */}
        <div className="p-6 bg-slate-100">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: copies }).map((_, index) => (
              <div key={index} className="print-break">
                <ItemSticker item={item} schoolName={schoolName} labName={labName} />
              </div>
            ))}
          </div>
        </div>

        {/* Print Instructions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-2">Petunjuk Cetak:</h3>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Gunakan kertas stiker thermal atau label Tom & Jerry</li>
            <li>• Atur ukuran kertas di printer setting sesuai ukuran stiker</li>
            <li>• Pastikan margin printer diatur ke minimum</li>
            <li>• Untuk hasil terbaik, gunakan printer resolusi tinggi</li>
          </ul>
        </div>
      </div>
    </div>
  )
}