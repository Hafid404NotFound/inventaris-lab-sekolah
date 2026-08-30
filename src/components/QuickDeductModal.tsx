'use client'

import { useState } from 'react'
import { Item } from '@/types/database'
import { Minus, X, Beaker, FlaskConical } from 'lucide-react'

interface QuickDeductModalProps {
  item: Item
  onClose: () => void
  onDeduct: (amount: number, reason: string) => void
}

export default function QuickDeductModal({ item, onClose, onDeduct }: QuickDeductModalProps) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const deductAmount = parseFloat(amount)
    if (deductAmount > 0 && deductAmount <= item.available_qty) {
      onDeduct(deductAmount, reason)
      onClose()
    }
  }

  const presetAmounts = [
    { label: '10%', value: Math.ceil(item.available_qty * 0.1) },
    { label: '25%', value: Math.ceil(item.available_qty * 0.25) },
    { label: '50%', value: Math.ceil(item.available_qty * 0.5) },
    { label: '100%', value: item.available_qty },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              {item.type === 'bahan' ? <Beaker className="w-5 h-5 text-purple-600" /> : <FlaskConical className="w-5 h-5 text-purple-600" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Quick Deduct</h2>
              <p className="text-sm text-slate-600">{item.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Stok Tersedia:</span>
            <span className="font-semibold text-slate-800">
              {item.available_qty} {item.unit}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Jumlah Pengurangan</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={item.available_qty}
                min="0"
                step="0.1"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="0"
                required
              />
              <span className="px-3 py-2 bg-slate-100 rounded-lg text-slate-600 min-w-[60px] text-center">
                {item.unit}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Preset</label>
            <div className="grid grid-cols-4 gap-2">
              {presetAmounts.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setAmount(preset.value.toString())}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Alasan Pengurangan</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              required
            >
              <option value="">Pilih alasan...</option>
              <option value="praktikum_selesai">Praktikum Selesai</option>
              <option value="kedaluwarsa">Kedaluwarsa</option>
              <option value="rusak">Rusak/Tumpah</option>
              <option value="pencatatan">Koreksi Pencatatan</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>

          {reason === 'lainnya' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Detail Alasan</label>
              <textarea
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                rows={2}
                placeholder="Jelaskan alasan pengurangan..."
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Kurangi Stok
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}