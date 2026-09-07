"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Beaker,
  Package,
  Plus,
  Edit,
  Trash2,
  Lock,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import AuthGuard from "@/components/AuthGuard";
import ItemForm from "@/components/ItemForm";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  getItems,
  updateItem,
  deleteItem,
  createItem,
} from "@/lib/supabase-items";
import { getRoomById } from "@/lib/supabase-rooms";
import { getLabs } from "@/lib/supabase-labs";
import { Item, Lab } from "@/types/database";

type ItemRow = Item & {
  labs?: { id: string; name: string } | null;
  rooms?: {
    id: string;
    name: string;
    code: string | null;
    lab_id?: string;
  } | null;
  categories?: { name: string } | null;
};

function truncateWords(text?: string | null, maxWords: number = 5): string {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}

function GoodsPageContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("room_id") || undefined;

  const { user } = useAuth();
  const [items, setItems] = useState<ItemRow[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [roomName, setRoomName] = useState("");
  const [roomLabId, setRoomLabId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // State Modal Form & Delete
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [itemData, room, labsData] = await Promise.all([
        getItems(roomId ? { room_id: roomId } : undefined),
        roomId ? getRoomById(roomId) : Promise.resolve(null),
        getLabs(),
      ]);

      setItems((itemData || []) as ItemRow[]);
      setRoomName(room?.name || "");
      setRoomLabId((room as any)?.lab_id || null);
      setLabs((labsData || []) as Lab[]);
    } catch (error) {
      console.error("Error loading goods:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [roomId]);

  // Hak Akses: Cek apakah user berhak menambah barang di halaman ini
  // (Jika di filter ruangan peserta lain, tombol tambah disembunyikan)
  const canAddItem =
    !roomId ||
    (user?.lab_id && roomLabId === user.lab_id) ||
    user?.role === "super_admin";

  // Handler Submit (Create / Edit)
  const handleSubmitItem = async (
    itemPayload: Omit<Item, "id" | "created_at">,
  ) => {
    try {
      if (formMode === "edit" && selectedItem) {
        const updated = await updateItem(
          selectedItem.id,
          itemPayload as Parameters<typeof updateItem>[1],
        );
        setItems((prev) =>
          prev.map((i) =>
            i.id === selectedItem.id ? ({ ...i, ...updated } as ItemRow) : i,
          ),
        );
        alert("Barang berhasil diperbarui!");
      } else {
        const newItem = await createItem({
          ...itemPayload,
          lab_id: user?.lab_id || itemPayload.lab_id,
        });
        setItems((prev) => [newItem as ItemRow, ...prev]);
        alert("Barang berhasil ditambahkan!");
      }

      setShowFormModal(false);
      setSelectedItem(null);
    } catch (err: any) {
      console.error("Error saving item:", err);
      alert(`Gagal menyimpan: ${err.message || "Terjadi kesalahan"}`);
    }
  };

  // Handler Delete Item
  const handleDeleteItem = async () => {
    if (selectedItem) {
      try {
        await deleteItem(selectedItem.id);
        setItems((prev) => prev.filter((i) => i.id !== selectedItem.id));
        setShowDeleteModal(false);
        setSelectedItem(null);
        alert("Barang berhasil dihapus!");
      } catch (err: any) {
        console.error("Error deleting item:", err);
        alert(
          `Gagal menghapus: ${err.message || "Barang ini bukan milik akun Anda"}`,
        );
      }
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex items-center gap-3">
            <Link
              href={roomId ? `/ruangan` : "/dashboard/labs"}
              className="p-2 rounded-lg hover:bg-slate-100 transition"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Master Alat &amp; Bahan
              </h1>
              <p className="mt-1 text-slate-600 text-sm">
                {roomName
                  ? `Barang pada ${roomName}`
                  : "Semua barang laboratorium (Katalog Publik & Milik Anda)"}
              </p>
            </div>

            {/* Tombol Tambah hanya aktif jika milik lab sendiri */}
            {canAddItem && (
              <button
                type="button"
                onClick={() => {
                  setSelectedItem(null);
                  setFormMode("add");
                  setShowFormModal(true);
                }}
                className="ml-auto inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition"
              >
                <Plus className="h-4 w-4" /> Tambah Barang
              </button>
            )}
          </div>

          {/* Tabel Data Barang */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 table-fixed">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 w-12">
                      No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 w-24">
                      Kode
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 w-60">
                      Nama Barang
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 w-20">
                      Jenis
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 w-28">
                      Kategori
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 w-24">
                      Stok
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 w-32">
                      Ruangan
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 w-28">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        Memuat data...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        Belum ada barang pada ruangan ini.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => {
                      // Cek apakah barang ini adalah milik NUP peserta yang sedang login
                      const isOwner =
                        user?.role === "super_admin" ||
                        (user?.lab_id && item.lab_id === user.lab_id);

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50 transition"
                        >
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-slate-600">
                            {item.code || "-"}
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            <Link
                              href={`/barang/${item.id}`}
                              className="font-medium text-emerald-700 hover:text-emerald-900 hover:underline block truncate"
                              title={item.name}
                            >
                              {truncateWords(item.name, 5)}
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${item.type === "alat" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}
                            >
                              {item.type === "alat" ? (
                                <Package className="h-3.5 w-3.5" />
                              ) : (
                                <Beaker className="h-3.5 w-3.5" />
                              )}
                              {item.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {item.categories?.name || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            {item.available_qty} / {item.total_qty}{" "}
                            {item.unit || ""}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {item.rooms?.name
                              ? truncateWords(item.rooms.name, 5)
                              : "Belum ditentukan"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Link
                                href={`/barang/${item.id}`}
                                className="text-xs font-medium text-emerald-700 hover:underline"
                              >
                                Detail
                              </Link>

                              {/* Jika MILIK SENDIRI: muncul tombol Edit & Hapus */}
                              {isOwner ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setFormMode("edit");
                                      setShowFormModal(true);
                                    }}
                                    className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                    title="Edit Barang"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setShowDeleteModal(true);
                                    }}
                                    className="p-1 rounded text-red-500 hover:bg-red-50 hover:text-red-700"
                                    title="Hapus Barang"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                /* Jika MILIK ORANG LAIN: ikon gembok read-only */
                                <span title="Read-only (Milik Peserta Lain)">
                                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Add / Edit */}
        {showFormModal && (
          <ItemForm
            item={selectedItem}
            labs={labs}
            onSubmit={handleSubmitItem}
            onCancel={() => {
              setShowFormModal(false);
              setSelectedItem(null);
            }}
            mode={formMode}
          />
        )}

        {/* Modal Delete Confirm */}
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
      </DashboardLayout>
    </AuthGuard>
  );
}

export default function GoodsPage() {
  return (
    <Suspense fallback={<div className="p-6">Memuat data barang...</div>}>
      <GoodsPageContent />
    </Suspense>
  );
}
