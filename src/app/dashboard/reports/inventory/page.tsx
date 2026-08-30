"use client";

import { useState, useEffect } from "react";
import { Item, ItemType, ItemCondition, Lab } from "@/types/database";
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Search,
  FlaskConical,
  CheckCircle,
  AlertTriangle,
  Package,
  FileSpreadsheet,
  Printer,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";

export default function InventoryReportsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedLab, setSelectedLab] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<
    ItemCondition | "all"
  >("all");
  const [selectedType, setSelectedType] = useState<ItemType | "all">("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    // Mock data - in production this would come from Supabase
    setTimeout(() => {
      setItems([
        {
          id: "1",
          lab_id: "1",
          category_id: "cat1",
          name: "Mikroskop Binokuler",
          code: "KIM-001",
          type: "alat",
          total_qty: 15,
          available_qty: 12,
          unit: "pcs",
          condition: "baik",
          location_rack: "Rak A-1",
          min_stock_alert: 5,
          specs_detail: "Mikroskop binokuler 1000x dengan lampu LED",
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          lab_id: "1",
          category_id: "cat1",
          name: "Tabung Reaksi",
          code: "KIM-002",
          type: "alat",
          total_qty: 50,
          available_qty: 45,
          unit: "pcs",
          condition: "baik",
          location_rack: "Rak B-2",
          min_stock_alert: 10,
          specs_detail: "Tabung reaksi kaca borosilikat 10ml",
          created_at: new Date().toISOString(),
        },
        {
          id: "3",
          lab_id: "1",
          category_id: "cat2",
          name: "Asam Sulfat",
          code: "KIM-003",
          type: "bahan",
          total_qty: 2000,
          available_qty: 500,
          unit: "ml",
          condition: "baik",
          location_rack: "Lemari B3",
          min_stock_alert: 1000,
          specs_detail: "Asam sulfat 98%",
          expired_date: "2025-12-31",
          created_at: new Date().toISOString(),
        },
        {
          id: "4",
          lab_id: "2",
          category_id: "cat3",
          name: "Multimeter Digital",
          code: "FIS-001",
          type: "alat",
          total_qty: 20,
          available_qty: 18,
          unit: "pcs",
          condition: "baik",
          location_rack: "Rak C-1",
          min_stock_alert: 5,
          specs_detail: "Multimeter digital dengan fungsi AC/DC",
          created_at: new Date().toISOString(),
        },
        {
          id: "5",
          lab_id: "3",
          category_id: "cat4",
          name: "Laptop Komputer",
          code: "KOM-001",
          type: "alat",
          total_qty: 30,
          available_qty: 28,
          unit: "pcs",
          condition: "baik",
          location_rack: "Meja 1-30",
          min_stock_alert: 25,
          specs_detail: "Laptop Intel Core i5, 8GB RAM, 256GB SSD",
          created_at: new Date().toISOString(),
        },
      ]);

      setLabs([
        {
          id: "22222222-2222-4222-8222-222222222222",
          school_id: "11111111-1111-4111-8111-111111111111",
          name: "Lab Kimia",
          category: "Sains",
          pic_name: "Budi Santoso",
          location: "Gedung A Lt. 2",
          created_at: new Date().toISOString(),
        },
        {
          id: "33333333-3333-4333-8333-333333333333",
          school_id: "11111111-1111-4111-8111-111111111111",
          name: "Lab Fisika",
          category: "Sains",
          pic_name: "Dewi Lestari",
          location: "Gedung A Lt. 3",
          created_at: new Date().toISOString(),
        },
        {
          id: "44444444-4444-4444-8444-444444444444",
          school_id: "11111111-1111-4111-8111-111111111111",
          name: "Lab Komputer",
          category: "Teknologi",
          pic_name: "Andi Wijaya",
          location: "Gedung B Lt. 1",
          created_at: new Date().toISOString(),
        },
      ]);

      setLoading(false);
    }, 500);
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLab = selectedLab === "all" || item.lab_id === selectedLab;
    const matchesType = selectedType === "all" || item.type === selectedType;
    const matchesCondition =
      selectedCondition === "all" || item.condition === selectedCondition;

    if (dateRange.start && dateRange.end) {
      const itemDate = new Date(item.created_at);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      return itemDate >= startDate && itemDate <= endDate;
    }

    return matchesSearch && matchesLab && matchesType && matchesCondition;
  });

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredItems.map((item) => ({
        Kode: item.code,
        "Nama Barang": item.name,
        Tipe: item.type,
        "Total Stok": item.total_qty,
        "Stok Tersedia": item.available_qty,
        Satuan: item.unit,
        Kondisi: item.condition.replace("_", " "),
        Lokasi: item.location_rack,
        "Min. Alert": item.min_stock_alert,
        Kadaluwarsa: item.expired_date || "-",
        Spesifikasi: item.specs_detail,
      })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventaris");

    // Generate official format
    const header = [
      ["LAPORAN INVENTARIS LABORATORIUM", "", "", ""],
      ["SMA Negeri 1 Jakarta", "", "", ""],
      ["", "", "", ""],
      [
        "No",
        "Kode",
        "Nama Barang",
        "Tipe",
        "Total Stok",
        "Tersedia",
        "Satuan",
        "Kondisi",
        "Lokasi",
        "Kadaluwarsa",
      ],
    ];

    const data = filteredItems.map((item, index) => [
      index + 1,
      item.code,
      item.name,
      item.type,
      item.total_qty,
      item.available_qty,
      item.unit,
      item.condition.replace("_", " "),
      item.location_rack,
      item.expired_date || "-",
    ]);

    const officialWorksheet = XLSX.utils.aoa_to_sheet([...header, ...data]);
    XLSX.utils.book_append_sheet(workbook, officialWorksheet, "Rekapitulasi");

    XLSX.writeFile(
      workbook,
      `Laporan_Inventaris_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.text("LAPORAN INVENTARIS LABORATORIUM", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("SMA Negeri 1 Jakarta", 105, 28, { align: "center" });

    doc.setFontSize(10);
    doc.text(
      `Tanggal: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
      105,
      35,
      { align: "center" },
    );

    // Filter info
    let filterText = "Semua Data";
    if (selectedLab !== "all") {
      const lab = labs.find((l) => l.id === selectedLab);
      filterText = `Lab: ${lab?.name}`;
    }
    doc.text(`Filter: ${filterText}`, 105, 42, { align: "center" });

    // Table
    const tableData = filteredItems.map((item, index) => [
      index + 1,
      item.code,
      item.name,
      item.type,
      `${item.available_qty}/${item.total_qty} ${item.unit}`,
      item.condition.replace("_", " "),
      item.location_rack,
      item.expired_date || "-",
    ]);

    autoTable(doc, {
      head: [
        [
          "No",
          "Kode",
          "Nama Barang",
          "Tipe",
          "Stok",
          "Kondisi",
          "Lokasi",
          "Kadaluwarsa",
        ],
      ],
      body: tableData,
      startY: 50,
      styles: {
        head: { fillColor: [5, 150, 105], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 20 },
        2: { cellWidth: 40 },
        3: { cellWidth: 15 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 25 },
        7: { cellWidth: 20 },
      },
    });

    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Total Item: ${filteredItems.length}`, 14, finalY);
    const totalValue = (filteredItems.length * 1000000).toLocaleString("id-ID");
    doc.text(`Total Nilai Aset: Rp ${totalValue}`, 14, finalY + 7);

    // Signature area
    const signatureY = finalY + 30;
    doc.text("Mengetahui,", 14, signatureY);
    doc.text("Kepala Lab", 14, signatureY + 5);
    doc.text("", 14, signatureY + 25);
    doc.text("Menyetujui,", 100, signatureY);
    doc.text("Kepala Sekolah", 100, signatureY + 5);

    doc.save(
      `Laporan_Inventaris_${new Date().toISOString().split("T")[0]}.pdf`,
    );
  };

  const getConditionColor = (condition: ItemCondition) => {
    switch (condition) {
      case "baik":
        return "bg-green-100 text-green-800";
      case "rusak_ringan":
        return "bg-yellow-100 text-yellow-800";
      case "rusak_berat":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Laporan Inventaris
          </h1>
          <p className="text-slate-600 mt-1">
            Export laporan standar akreditasi & BOS
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={exportToPDF}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-800">Filter Laporan</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Laboratorium
            </label>
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="all">Semua Lab</option>
              {labs.map((lab) => (
                <option key={lab.id} value={lab.id}>
                  {lab.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipe
            </label>
            <select
              value={selectedType}
              onChange={(e) =>
                setSelectedType(e.target.value as ItemType | "all")
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="all">Semua Tipe</option>
              <option value="alat">Alat</option>
              <option value="bahan">Bahan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Kondisi
            </label>
            <select
              value={selectedCondition}
              onChange={(e) =>
                setSelectedCondition(e.target.value as ItemCondition | "all")
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="all">Semua Kondisi</option>
              <option value="baik">Baik</option>
              <option value="rusak_ringan">Rusak Ringan</option>
              <option value="rusak_berat">Rusak Berat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              setSelectedLab("all");
              setSelectedType("all");
              setSelectedCondition("all");
              setDateRange({ start: "", end: "" });
              setSearchTerm("");
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition text-sm"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Cari barang..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="text-3xl font-bold text-slate-800">
                {filteredItems.length}
              </p>
              <p className="text-sm text-slate-600">Total Item</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <FlaskConical className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-3xl font-bold text-slate-800">
                {filteredItems.filter((i) => i.type === "alat").length}
              </p>
              <p className="text-sm text-slate-600">Alat</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <FlaskConical className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-3xl font-bold text-slate-800">
                {filteredItems.filter((i) => i.type === "bahan").length}
              </p>
              <p className="text-sm text-slate-600">Bahan</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-3xl font-bold text-slate-800">
                {filteredItems.filter((i) => i.condition === "baik").length}
              </p>
              <p className="text-sm text-slate-600">Kondisi Baik</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Kode
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Nama Barang
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Kondisi
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Lokasi
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Kadaluwarsa
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedItems.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-slate-600">
                      {item.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">{item.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.type === "alat"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">
                        {item.available_qty}
                      </span>
                      <span className="text-slate-400">/</span>
                      <span className="text-slate-500">{item.total_qty}</span>
                      <span className="text-slate-400 text-sm">
                        {item.unit}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}
                    >
                      {item.condition.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {item.location_rack}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {item.expired_date || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span className="text-sm text-slate-600">per halaman</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <span className="text-sm text-slate-600">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
