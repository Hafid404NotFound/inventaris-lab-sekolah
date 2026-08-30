'use client'

import { useState } from 'react'
import { Loan, ItemCondition } from '@/types/database'
import { CheckCircle, XCircle, AlertTriangle, X, Calendar, User } from 'lucide-react'

interface CheckInModalProps {
  loan: Loan
  itemName: string
  onClose: () => void
  onCheckIn: (condition: ItemCondition, notes: string) => void
}

export default function CheckInModal({ loan, itemName, onClose, onCheckIn }: CheckInModalProps) {
  const [condition, setCondition] = useState<ItemCondition>('baik')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCheckIn(condition, notes)
    onClose()
  }

  const conditionOptions = [
    { value: 'baik' as ItemCondition, label: 'Baik', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
    { value: 'rusak_ringan' as ItemCondition, label: 'Rusak Ringan', icon: AlertTriangle, color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-200' },
    { value: 'rusak_berat' as ItemCondition, label: 'Rusak Berat', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Check-in Pengembalian</h2>
            <p className="text-sm text-slate-600">{itemName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Loan Info */}
        <div className="bg-slate-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <User className="w-5 h-5 text-slate-500" />
            <div>
              <p className="font-medium text-slate-800">{loan.borrower_name}</p>
              <p className="text-sm text-slate-600 capitalize">{loan.borrower_role.replace('_', ' ')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-slate-500" />
            <div>
              <p className="text-sm text-slate-600">Tanggal Pinjam</p>
              <p className="font-medium text-slate-800">
                {new Date(loan.loan_date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Jumlah: <span className="font-medium text-slate-800">{loan.qty} unit</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Kondisi Barang</label>
            <div className="grid grid-cols-3 gap-3">
              {conditionOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setCondition(option.value)}
                    className={`p-4 rounded-lg border-2 transition ${
                      condition === option.value
                        ? `${option.bgColor} border-current ${option.color}`
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${condition === option.value ? option.color : 'text-slate-400'}`} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Catatan</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              rows={3}
              placeholder="Catat kondisi detail atau kerusakan..."
            />
          </div>

          {condition !== 'baik' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>Perhatian:</strong> Barang dalam kondisi {condition.replace('_', ' ')} akan:
              </p>
              <ul className="text-sm text-amber-700 mt-2 list-disc list-inside">
                <li>Dicatat di log riwayat kerusakan</li>
                <li>Stok "kondisi baik" akan dikurangi</li>
                <li>Perlu tindak lanjut perbaikan/penggantian</li>
              </ul>
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
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              Konfirmasi Pengembalian
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}