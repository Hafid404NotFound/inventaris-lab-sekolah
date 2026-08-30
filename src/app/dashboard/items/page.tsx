"use client";

import { useState, useEffect } from "react";
import { Item, ItemType, ItemCondition, Lab } from "@/types/database";
import { useAuth } from "@/contexts/AuthContext";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  Beaker,
  Wrench,
  Printer,
  Minus,
  Upload,
  FileSpreadsheet,
} from "lucide-react";
import PrintStickerModal from "@/components/PrintStickerModal";
import QuickDeductModal from "@/components/QuickDeductModal";
import DamageLog from "@/components/DamageLog";
import Pagination from "@/components/Pagination";
import ItemForm from "@/components/ItemForm";
import ExcelImportModal from "@/components/ExcelImportModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
  updateItemStock,
} from "@/lib/supabase-items";
import { getLabs } from "@/lib/supabase-labs";
import { exportItemsToExcel } from "@/utils/excelImport";
import Link from "next/link";

type ItemWithRelations = Item & {
  labs?: { name: string } | null;
  rooms?: { name: string; code: string | null } | null;
  categories?: { name: string } | null;
};

// Helper untuk mengambil 5 kata pertama
function truncateWords(text?: string | null, maxWords: number = 5): string {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}

export default function ItemsPage() {
  const { hasPermission } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<ItemType | "all">("all");
  const [filterLab, setFilterLab] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Check if user has permission to edit/delete
  const canEditDelete = hasPermission(["super_admin", "kepala_lab"]);
  const canImport = hasPermission(["super_admin", "kepala_lab"]);

  const loadItems = async () => {
    try {
      const data = (await getItems()) as ItemWithRelations[];
      setItems((data || []) as Item[]);
    } catch (error) {
      console.error("Error loading items:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const [itemsData, labsData] = await Promise.all([
          getItems(),
          getLabs(),
        ]);

        if (!mounted) return;

        setItems((itemsData || []) as Item[]);
        setLabs((labsData || []) as Lab[]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        if (mounted) {
          setItems([]);
          setLabs([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void init();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesLab = filterLab === "all" || item.lab_id === filterLab;
    return matchesSearch && matchesType && matchesLab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  const getLabName = (item: ItemWithRelations) => {
    return (
      item.labs?.name ||
      labs.find((lab) => lab.id === item.lab_id)?.name ||
      "Lab tidak diketahui"
    );
  };

  const getCategoryName = (item: ItemWithRelations) => {
    return item.categories?.name || "Kategori tidak diketahui";
  };

  const getLowStockItems = () =>
    items.filter((item) => item.available_qty <= item.min_stock_alert);

  const expiringItems = items.filter((item) => {
    if (!item.expired_date) return false;
    const expiryDate = new Date(item.expired_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  });

  const getStockStatus = (item: Item) => {
    if (item.available_qty <= item.min_stock_alert) {
      return { label: "Hampir Habis", color: "bg-red-100 text-red-800" };
    }
    if (item.available_qty <= item.min_stock_alert * 2) {
      return { label: "Stok Sedikit", color: "bg-amber-100 text-amber-800" };
    }
    return { label: "Tersedia", color: "bg-green-100 text-green-800" };
  };

  const getExpiryStatus = (item: Item) => {
    if (!item.expired_date) return null;
    const expiryDate = new Date(item.expired_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntilExpiry < 0) {
      return { label: "Kedaluwarsa", color: "bg-red-100 text-red-800" };
    }
    if (daysUntilExpiry <= 7) {
      return { label: "Kadaluarsa < 7 hari", color: "bg-red-100 text-red-800" };
    }
    if (daysUntilExpiry <= 30) {
      return {
        label: "Kadaluarsa < 30 hari",
        color: "bg-amber-100 text-amber-800",
      };
    }
    return null;
  };

  const getTypeIcon = (type: ItemType) => {
    return type === "alat" ? (
      <Wrench className="w-4 h-4" />
    ) : (
      <Beaker className="w-4 h-4" />
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

  const handleDeductStock = async (amount: number) => {
    if (selectedItem) {
      try {
        const newStock = Math.max(0, selectedItem.available_qty - amount);
        await updateItemStock(selectedItem.id, newStock);
        setItems(
          items.map((item) =>
            item.id === selectedItem.id
              ? { ...item, available_qty: newStock }
              : item,
          ),
        );
      } catch (error) {
        console.error("Error updating stock:", error);
        alert("Gagal mengupdate stok");
      }
    }
  };

  const handleCreateItem = async (itemPayload: any) => {
    try {
      // Pastikan lab_id selalu ada (ambil dari lab yang dipilih atau lab pertama)
      const validLabId =
        itemPayload.lab_id ||
        (filterLab !== "all" ? filterLab : labs[0]?.id) ||
        null;

      const payload = {
        ...itemPayload,
        lab_id: validLabId,
      };

      const newItem = await createItem(payload);

      setItems((prev) => [newItem, ...prev]);
      setShowAddModal(false);
      alert("Item berhasil ditambahkan!");
    } catch (error: any) {
      console.error("❌ Error creating item:", error);
      alert(
        `Gagal menambahkan item: ${error?.message || "Periksa data input Anda"}`,
      );
    }
  };

  const handleEditItem = async (item: Omit<Item, "id" | "created_at">) => {
    if (selectedItem) {
      try {
        const normalizeOptional = (value?: string | null) => {
          if (typeof value !== "string") return null;
          return value.trim() === "" ? null : value;
        };

        const payload = {
          ...item,
          category_id: normalizeOptional(item.category_id),
          code: item.code?.trim() ? item.code.trim() : null,
          specs_detail: normalizeOptional(item.specs_detail),
          expired_date: normalizeOptional(item.expired_date),
          image_url: normalizeOptional(item.image_url),
          location_rack: normalizeOptional(item.location_rack),
          updated_at: item.updated_at ?? new Date().toISOString(),
        } as Parameters<typeof updateItem>[1];

        const updatedItem = await updateItem(selectedItem.id, payload);
        setItems(
          items.map((i) => (i.id === selectedItem.id ? updatedItem : i)),
        );
        setShowEditModal(false);
        setSelectedItem(null);
        alert("Item berhasil diupdate");
      } catch (error) {
        console.error("Error updating item:", error);
        alert("Gagal mengupdate item");
      }
    }
  };

  const handleDeleteItem = async () => {
    if (selectedItem) {
      try {
        await deleteItem(selectedItem.id);
        setItems(items.filter((i) => i.id !== selectedItem.id));
        setShowDeleteModal(false);
        setSelectedItem(null);
        alert("Item berhasil dihapus");
      } catch (error) {
        console.error("Error deleting item:", error);
        alert("Gagal menghapus item");
      }
    }
  };

  const handleImportItems = async (
    itemsToImport: Array<Record<string, unknown>>,
  ) => {
    try {
      for (const item of itemsToImport) {
        await createItem(item as unknown as Parameters<typeof createItem>[0]);
      }
      await loadItems();
      alert(`${itemsToImport.length} item berhasil diimport`);
    } catch (error) {
      console.error("Error importing items:", error);
      alert("Gagal mengimport item");
    }
  };

  const handleExportItems = () => {
    const selectedLab = labs.find((lab) => lab.id === filterLab);
    const labName = selectedLab?.name || undefined;
    exportItemsToExcel(filteredItems, labName);
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
            Master Alat & Bahan
          </h1>
          <p className="text-slate-600 mt-1">
            Kelola semua peralatan dan bahan laboratorium
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Item</span>
          </button>
          {canImport && (
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Upload className="w-5 h-5" />
              <span>Import Excel</span>
            </button>
          )}
          <button
            onClick={handleExportItems}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Stock Alert */}
      {getLowStockItems().length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div className="flex-1">
              <p className="font-medium text-amber-800">
                {getLowStockItems().length} item dengan stok menipis
              </p>
              <p className="text-sm text-amber-700">
                Segera lakukan restock untuk item berikut
              </p>
            </div>
          </div>
        </div>
      )}

      {expiringItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div className="flex-1">
              <p className="font-medium text-red-800">
                {expiringItems.length} item akan kedaluwarsa dalam 30 hari
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Damage Log Section */}
      <DamageLog
        damages={[]}
        onAdd={(damage) => {
          console.log("Damage reported:", damage);
        }}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ItemType | "all")}
            className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            <option value="all">Semua Tipe</option>
            <option value="alat">Alat</option>
            <option value="bahan">Bahan</option>
          </select>
          <select
            value={filterLab}
            onChange={(e) => setFilterLab(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            <option value="all">Semua Lab</option>
            {labs.map((lab) => (
              <option key={lab.id} value={lab.id}>
                {lab.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Kode
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
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${item.type === "alat" ? "bg-blue-100" : "bg-purple-100"}`}
                      >
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {item.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {getLabName(item as ItemWithRelations)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {getCategoryName(item as ItemWithRelations)}
                        </p>
                        <p
                          className="text-xs text-slate-400"
                          title={item.specs_detail || undefined}
                        >
                          {truncateWords(item.specs_detail, 5)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-slate-600">
                      {item.code || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        item.type === "alat"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {getTypeIcon(item.type)}
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
                      {item.available_qty <= item.min_stock_alert && (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <div className="mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getStockStatus(item).color}`}
                      >
                        {getStockStatus(item).label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}
                      >
                        {item.condition.replace("_", " ")}
                      </span>
                      {getExpiryStatus(item) && (
                        <div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${getExpiryStatus(item)?.color}`}
                          >
                            {getExpiryStatus(item)?.label}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">
                      <p>
                        {(item as ItemWithRelations).rooms?.name ||
                          "Belum ditentukan"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.location_rack || "Rak belum ditentukan"}
                      </p>
                      {!item.room_id && canEditDelete && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItem(item);
                            setShowEditModal(true);
                          }}
                          className="mt-1 text-xs font-medium text-emerald-700 hover:underline"
                        >
                          Pilih Ruangan
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {item.type === "bahan" && (
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowDeductModal(true);
                          }}
                          className="p-2 hover:bg-purple-50 rounded-lg transition"
                          title="Quick Deduct Stok"
                        >
                          <Minus className="w-4 h-4 text-purple-600" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowPrintModal(true);
                        }}
                        className="p-2 hover:bg-emerald-50 rounded-lg transition"
                        title="Cetak Label QR"
                      >
                        <Printer className="w-4 h-4 text-emerald-600" />
                      </button>
                      <Link
                        href={`/barang/${item.id}`}
                        className="px-2 text-xs font-medium text-emerald-700 hover:underline"
                        title="Detail Item"
                      >
                        Detail
                      </Link>
                      {canEditDelete && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setShowEditModal(true);
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg transition"
                            title="Edit Item"
                          >
                            <Edit className="w-4 h-4 text-slate-600" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg transition"
                            title="Hapus Item"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredItems.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600">
            Belum ada data item
          </h3>
          <p className="text-slate-500 mt-1">
            Mulai tambahkan item baru untuk mengelola inventaris laboratorium
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Item Pertama</span>
          </button>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <ItemForm
          labs={labs}
          onSubmit={handleCreateItem}
          onCancel={() => setShowAddModal(false)}
          mode="add"
        />
      )}

      {showEditModal && selectedItem && (
        <ItemForm
          item={selectedItem}
          labs={labs}
          onSubmit={handleEditItem}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          mode="edit"
        />
      )}

      {showPrintModal && selectedItem && (
        <PrintStickerModal
          item={selectedItem}
          schoolName="SMA Negeri 1 Jakarta"
          labName={getLabName(selectedItem as ItemWithRelations)}
          onClose={() => {
            setShowPrintModal(false);
            setSelectedItem(null);
          }}
        />
      )}

      {showDeductModal && selectedItem && (
        <QuickDeductModal
          item={selectedItem}
          onClose={() => {
            setShowDeductModal(false);
            setSelectedItem(null);
          }}
          onDeduct={handleDeductStock}
        />
      )}

      {showImportModal && (
        <ExcelImportModal
          labs={labs}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportItems}
        />
      )}

      {showDeleteModal && selectedItem && (
        <DeleteConfirmModal
          itemName={selectedItem.name}
          itemCount={selectedItem.available_qty}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedItem(null);
          }}
          onConfirm={handleDeleteItem}
        />
      )}
    </div>
  );
}
