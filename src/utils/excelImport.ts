import * as XLSX from 'xlsx'
import { ItemType, ItemCondition, Item } from '@/types/database'

export interface ExcelItemData {
  nama?: string
  kode?: string
  tipe?: string
  kategori?: string
  laboratorium?: string
  total_stok?: number
  stok_tersedia?: number
  satuan?: string
  kondisi?: string
  lokasi?: string
  min_alert?: number
  kadaluwarsa?: string
  spesifikasi?: string
}

/**
 * Download Excel template for import
 */
export function downloadExcelTemplate() {
  const templateData = [
    {
      'Nama Item': 'Mikroskop Binokuler',
      'Kode Barang': 'KIM-ALT-001',
      'Tipe': 'Alat',
      'Kategori': 'Peralatan Glass',
      'Laboratorium': 'Lab Kimia',
      'Total Stok': 15,
      'Stok Tersedia': 15,
      'Satuan': 'pcs',
      'Kondisi': 'Baik',
      'Lokasi Rak': 'Rak A-1',
      'Min Alert': 5,
      'Kadaluwarsa': '',
      'Spesifikasi': 'Mikroskop binokuler 1000x dengan lampu LED'
    },
    {
      'Nama Item': 'Asam Sulfat',
      'Kode Barang': 'KIM-BAH-001',
      'Tipe': 'Bahan',
      'Kategori': 'Bahan Kimia',
      'Laboratorium': 'Lab Kimia',
      'Total Stok': 2000,
      'Stok Tersedia': 2000,
      'Satuan': 'ml',
      'Kondisi': 'Baik',
      'Lokasi Rak': 'Lemari B3',
      'Min Alert': 1000,
      'Kadaluwarsa': '2025-12-31',
      'Spesifikasi': 'Asam sulfat 98%'
    }
  ]

  const worksheet = XLSX.utils.json_to_sheet(templateData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')

  // Set column widths
  worksheet['!cols'] = [
    { wch: 25 }, // Nama Item
    { wch: 15 }, // Kode Barang
    { wch: 10 }, // Tipe
    { wch: 20 }, // Kategori
    { wch: 15 }, // Laboratorium
    { wch: 10 }, // Total Stok
    { wch: 15 }, // Stok Tersedia
    { wch: 10 }, // Satuan
    { wch: 15 }, // Kondisi
    { wch: 15 }, // Lokasi Rak
    { wch: 10 }, // Min Alert
    { wch: 15 }, // Kadaluwarsa
    { wch: 30 }, // Spesifikasi
  ]

  XLSX.writeFile(workbook, 'Template_Import_Inventaris.xlsx')
}

/**
 * Parse Excel file and validate data
 */
export async function parseExcelFile(file: File): Promise<{
  data: ExcelItemData[]
  errors: string[]
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]

        const errors: string[] = []
        const validData: ExcelItemData[] = []

        jsonData.forEach((row, index) => {
          const item: ExcelItemData = {
            nama: row['Nama Item'] || row['nama'],
            kode: row['Kode Barang'] || row['kode'],
            tipe: row['Tipe'] || row['tipe'],
            kategori: row['Kategori'] || row['kategori'],
            laboratorium: row['Laboratorium'] || row['laboratorium'],
            total_stok: row['Total Stok'] || row['total_stok'],
            stok_tersedia: row['Stok Tersedia'] || row['stok_tersedia'],
            satuan: row['Satuan'] || row['satuan'],
            kondisi: row['Kondisi'] || row['kondisi'],
            lokasi: row['Lokasi Rak'] || row['lokasi'],
            min_alert: row['Min Alert'] || row['min_alert'],
            kadaluwarsa: row['Kadaluwarsa'] || row['kadaluwarsa'],
            spesifikasi: row['Spesifikasi'] || row['spesifikasi']
          }

          // Validation
          if (!item.nama) {
            errors.push(`Baris ${index + 2}: Nama Item wajib diisi`)
          }
          if (!item.kode) {
            errors.push(`Baris ${index + 2}: Kode Barang wajib diisi`)
          }
          if (!item.tipe || !['alat', 'bahan', 'Alat', 'Bahan'].includes(item.tipe)) {
            errors.push(`Baris ${index + 2}: Tipe harus "Alat" atau "Bahan"`)
          }
          if (!item.total_stok || item.total_stok <= 0) {
            errors.push(`Baris ${index + 2}: Total Stok harus lebih dari 0`)
          }
          if (item.stok_tersedia && item.total_stok && item.stok_tersedia > item.total_stok) {
            errors.push(`Baris ${index + 2}: Stok Tersedia tidak boleh lebih dari Total Stok`)
          }
          if (!item.laboratorium) {
            errors.push(`Baris ${index + 2}: Laboratorium wajib diisi`)
          }
          if (item.tipe?.toLowerCase() === 'bahan' && !item.kadaluwarsa) {
            errors.push(`Baris ${index + 2}: Kadaluwarsa wajib diisi untuk Bahan`)
          }

          validData.push(item)
        })

        resolve({ data: validData, errors })
      } catch (error) {
        reject(new Error('Gagal membaca file Excel'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Gagal membaca file'))
    }

    reader.readAsBinaryString(file)
  })
}

/**
 * Convert Excel data to item format
 */
export function convertExcelToItem(
  excelData: ExcelItemData,
  labId: string,
  categoryId: string
) {
  const typeMap: Record<string, ItemType> = {
    'alat': 'alat',
    'Alat': 'alat',
    'bahan': 'bahan',
    'Bahan': 'bahan'
  }

  const conditionMap: Record<string, ItemCondition> = {
    'baik': 'baik',
    'Baik': 'baik',
    'rusak ringan': 'rusak_ringan',
    'Rusak Ringan': 'rusak_ringan',
    'rusak berat': 'rusak_berat',
    'Rusak Berat': 'rusak_berat'
  }

  return {
    lab_id: labId,
    category_id: categoryId,
    name: excelData.nama || '',
    code: excelData.kode || '',
    type: typeMap[excelData.tipe || 'alat'] || 'alat',
    total_qty: excelData.total_stok || 0,
    available_qty: excelData.stok_tersedia || excelData.total_stok || 0,
    unit: excelData.satuan || 'pcs',
    condition: conditionMap[excelData.kondisi || 'baik'] || 'baik',
    location_rack: excelData.lokasi || '',
    min_stock_alert: excelData.min_alert || 5,
    specs_detail: excelData.spesifikasi || '',
    expired_date: excelData.kadaluwarsa || ''
  }
}

/**
 * Export items to Excel file
 */
export function exportItemsToExcel(items: Item[], labName?: string) {
  const exportData = items.map(item => ({
    'Nama Item': item.name,
    'Kode Barang': item.code || '',
    'Tipe': item.type === 'alat' ? 'Alat' : 'Bahan',
    'Total Stok': item.total_qty,
    'Stok Tersedia': item.available_qty,
    'Satuan': item.unit || '',
    'Kondisi': item.condition.replace('_', ' ').toUpperCase(),
    'Lokasi Rak': item.location_rack || '',
    'Min Alert': item.min_stock_alert,
    'Kadaluwarsa': item.expired_date || '',
    'Spesifikasi': item.specs_detail || ''
  }))

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventaris')

  // Set column widths
  worksheet['!cols'] = [
    { wch: 25 }, // Nama Item
    { wch: 15 }, // Kode Barang
    { wch: 10 }, // Tipe
    { wch: 10 }, // Total Stok
    { wch: 15 }, // Stok Tersedia
    { wch: 10 }, // Satuan
    { wch: 15 }, // Kondisi
    { wch: 15 }, // Lokasi Rak
    { wch: 10 }, // Min Alert
    { wch: 15 }, // Kadaluwarsa
    { wch: 30 }, // Spesifikasi
  ]

  const fileName = labName 
    ? `Export_Inventaris_${labName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
    : `Export_Inventaris_${new Date().toISOString().split('T')[0]}.xlsx`

  XLSX.writeFile(workbook, fileName)
}