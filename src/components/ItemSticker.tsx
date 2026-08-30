'use client'

import { Item } from '@/types/database'
import QRCodeGenerator from './QRCodeGenerator'
import { Building2, FlaskConical, MapPin } from 'lucide-react'

interface ItemStickerProps {
  item: Item
  schoolName: string
  labName: string
}

export default function ItemSticker({ item, schoolName, labName }: ItemStickerProps) {
  const qrValue = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/scan/item/${item.id}`

  return (
    <div className="bg-white border-2 border-slate-300 rounded-lg p-4 w-full max-w-xs">
      {/* Header */}
      <div className="border-b-2 border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-4 h-4 text-slate-800" />
          <p className="text-xs font-bold text-slate-800 uppercase">{schoolName}</p>
        </div>
        <div className="flex items-center gap-2">
          <FlaskConical className="w-3 h-3 text-slate-600" />
          <p className="text-xs font-semibold text-slate-600">{labName}</p>
        </div>
      </div>

      {/* Item Information */}
      <div className="space-y-2 mb-3">
        <div>
          <p className="text-[10px] text-slate-500 uppercase">Nama Barang</p>
          <p className="text-sm font-bold text-slate-800 leading-tight">{item.name}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Kode</p>
            <p className="text-sm font-mono font-semibold text-slate-800">{item.code || '-'}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Tipe</p>
            <p className="text-sm font-semibold text-slate-800 capitalize">{item.type}</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] text-slate-500 uppercase">Lokasi</p>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-600" />
            <p className="text-sm font-semibold text-slate-800">{item.location_rack || '-'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Stok</p>
            <p className="text-sm font-semibold text-slate-800">
              {item.available_qty}/{item.total_qty} {item.unit}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Kondisi</p>
            <p className="text-sm font-semibold text-emerald-600 capitalize">
              {item.condition.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="flex justify-center border-t border-slate-200 pt-3">
        <QRCodeGenerator value={qrValue} size={80} level="H" />
      </div>

      {/* Footer */}
      <div className="mt-2 text-center">
        <p className="text-[8px] text-slate-400">Scan untuk info detail</p>
      </div>
    </div>
  )
}