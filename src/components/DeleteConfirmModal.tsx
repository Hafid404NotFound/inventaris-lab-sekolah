'use client'

import { Trash2, X, AlertTriangle } from 'lucide-react'

interface DeleteConfirmModalProps {
  itemName: string
  itemCount?: number
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteConfirmModal({ itemName, itemCount, onClose, onConfirm }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Konfirmasi Hapus</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-red-100 rounded-lg flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-slate-800 mb-2">
              Apakah Anda yakin ingin menghapus item <strong>"{itemName}"</strong>?
            </p>
            {itemCount && itemCount > 0 && (
              <p className="text-sm text-amber-600 mb-2">
                Item ini memiliki {itemCount} unit stok yang akan dihapus juga.
              </p>
            )}
            <p className="text-sm text-slate-600">
              Tindakan ini tidak dapat dibatalkan. Data yang dihapus akan hilang permanen.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition font-medium"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </div>
  )
}