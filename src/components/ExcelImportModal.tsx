'use client'

import { useState, useEffect } from 'react'
import { Upload, Download, X, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react'
import { parseExcelFile, downloadExcelTemplate, convertExcelToItem } from '@/utils/excelImport'
import { Lab, Category } from '@/types/database'
import { getCategoriesByLab } from '@/lib/supabase-categories'

interface ExcelImportModalProps {
  labs: Lab[]
  onClose: () => void
  onImport: (items: any[]) => void
}

export default function ExcelImportModal({ labs, onClose, onImport }: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [selectedLab, setSelectedLab] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [labCategories, setLabCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  // Load categories when lab changes
  useEffect(() => {
    const loadLabCategories = async () => {
      if (selectedLab) {
        setLoadingCategories(true)
        try {
          const cats = await getCategoriesByLab(selectedLab)
          setLabCategories(cats)
          setSelectedCategory('') // Reset category selection
        } catch (error) {
          console.error('Error loading categories:', error)
          setLabCategories([])
        } finally {
          setLoadingCategories(false)
        }
      } else {
        setLabCategories([])
      }
    }

    loadLabCategories()
  }, [selectedLab])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setIsParsing(true)
    setErrors([])

    try {
      const result = await parseExcelFile(selectedFile)
      setParsedData(result.data)
      setErrors(result.errors)
      setFile(selectedFile)
    } catch (error) {
      setErrors(['Gagal membaca file Excel. Pastikan format benar.'])
    } finally {
      setIsParsing(false)
    }
  }

  const handleImport = () => {
    if (!selectedLab || !selectedCategory) {
      setErrors(['Pilih Laboratorium dan Kategori untuk import'])
      return
    }

    if (parsedData.length === 0) {
      setErrors(['Tidak ada data valid untuk diimport'])
      return
    }

    const items = parsedData.map(data => convertExcelToItem(data, selectedLab, selectedCategory))
    onImport(items)
    onClose()
  }

  const handleDownloadTemplate = () => {
    downloadExcelTemplate()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-4xl p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Import Data dari Excel</h2>
            <p className="text-sm text-slate-600 mt-1">Upload file Excel untuk import bulk item</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Template Download */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800 mb-2">
                Download Template Excel
              </p>
              <p className="text-sm text-blue-700 mb-3">
                Gunakan template untuk memastikan format kolom yang benar
              </p>
              <button
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download Template</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lab & Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Laboratorium <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="">Pilih Laboratorium</option>
              {labs.map(lab => (
                <option key={lab.id} value={lab.id}>{lab.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={loadingCategories || !selectedLab}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="">Pilih Kategori</option>
              {labCategories && labCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {!selectedLab && (
              <p className="text-slate-500 text-xs mt-1">Pilih laboratorium terlebih dahulu</p>
            )}
          </div>
        </div>

        {/* File Upload */}
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 mb-6">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
            id="excel-upload"
            disabled={isParsing}
          />
          <label
            htmlFor="excel-upload"
            className="flex flex-col items-center cursor-pointer"
          >
            {isParsing ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
                <p className="text-sm text-slate-600">Membaca file Excel...</p>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-slate-400 mb-4" />
                <p className="text-sm text-slate-600 mb-2">
                  Klik untuk upload atau drag & drop file Excel
                </p>
                <p className="text-xs text-slate-500">
                  Format: .xlsx, .xls, .csv (Maks 5MB)
                </p>
              </>
            )}
          </label>
        </div>

        {/* Parsed Data Preview */}
        {parsedData.length > 0 && (
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-slate-800">
                {parsedData.length} item berhasil diparse
              </p>
            </div>
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Nama</th>
                    <th className="px-3 py-2 text-left">Kode</th>
                    <th className="px-3 py-2 text-left">Tipe</th>
                    <th className="px-3 py-2 text-left">Stok</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 10).map((item, index) => (
                    <tr key={index} className="border-t border-slate-200">
                      <td className="px-3 py-2">{item.nama}</td>
                      <td className="px-3 py-2 font-mono">{item.kode}</td>
                      <td className="px-3 py-2">{item.tipe}</td>
                      <td className="px-3 py-2">{item.total_stok}</td>
                    </tr>
                  ))}
                  {parsedData.length > 10 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-2 text-center text-slate-500">
                        ... dan {parsedData.length - 10} item lainnya
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm font-medium text-red-800">
                {errors.length} error ditemukan
              </p>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-red-700 mb-1">
                  {error}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition font-medium"
          >
            Batal
          </button>
          <button
            onClick={handleImport}
            disabled={parsedData.length === 0 || !selectedLab || !selectedCategory}
            className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import {parsedData.length} Item
          </button>
        </div>
      </div>
    </div>
  )
}