'use client'

import { useState } from 'react'
import { ItemCondition } from '@/types/database'
import { AlertTriangle, X, Calendar, User, Package } from 'lucide-react'

interface DamageLog {
  id: string
  itemId: string
  itemName: string
  condition: ItemCondition
  reportedBy: string
  reportedAt: string
  notes: string
  loanId?: string
}

interface DamageLogProps {
  damages: DamageLog[]
  onAdd?: (damage: Omit<DamageLog, 'id'>) => void
}

export default function DamageLog({ damages, onAdd }: DamageLogProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [newDamage, setNewDamage] = useState({
    itemId: '',
    itemName: '',
    condition: 'rusak_ringan' as ItemCondition,
    reportedBy: '',
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onAdd) {
      onAdd({
        ...newDamage,
        reportedAt: new Date().toISOString()
      })
    }
    setShowAddModal(false)
    setNewDamage({
      itemId: '',
      itemName: '',
      condition: 'rusak_ringan',
      reportedBy: '',
      notes: ''
    })
  }

  const getConditionColor = (condition: ItemCondition) => {
    switch (condition) {
      case 'rusak_ringan': return 'bg-amber-100 text-amber-800'
      case 'rusak_berat': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Log Riwayat Kerusakan</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition text-sm"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Lapor Kerusakan</span>
        </button>
      </div>

      <div className="space-y-3">
        {damages.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-lg">
            <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">Belum ada laporan kerusakan</p>
          </div>
        ) : (
          damages.map((damage) => (
            <div key={damage.id} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{damage.itemName}</p>
                    <p className="text-sm text-slate-600">ID: {damage.itemId}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(damage.condition)}`}>
                  {damage.condition.replace('_', ' ')}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User className="w-4 h-4" />
                  <span>{damage.reportedBy}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(damage.reportedAt).toLocaleDateString('id-ID')}</span>
                </div>
              </div>

              {damage.notes && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-sm text-slate-700">{damage.notes}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Damage Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">Lapor Kerusakan</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">ID Item</label>
                <input
                  type="text"
                  value={newDamage.itemId}
                  onChange={(e) => setNewDamage({ ...newDamage, itemId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="Kode atau ID item"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nama Item</label>
                <input
                  type="text"
                  value={newDamage.itemName}
                  onChange={(e) => setNewDamage({ ...newDamage, itemName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="Nama item"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kondisi Kerusakan</label>
                <select
                  value={newDamage.condition}
                  onChange={(e) => setNewDamage({ ...newDamage, condition: e.target.value as ItemCondition })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  <option value="rusak_ringan">Rusak Ringan</option>
                  <option value="rusak_berat">Rusak Berat</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pelapor</label>
                <input
                  type="text"
                  value={newDamage.reportedBy}
                  onChange={(e) => setNewDamage({ ...newDamage, reportedBy: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="Nama pelapor"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Detail Kerusakan</label>
                <textarea
                  value={newDamage.notes}
                  onChange={(e) => setNewDamage({ ...newDamage, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  rows={3}
                  placeholder="Jelaskan detail kerusakan..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Simpan Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}