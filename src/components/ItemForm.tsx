"use client";

import { useState, useEffect } from "react";
import { Item, Lab, Room } from "@/types/database";
import { supabase } from "@/lib/supabase";
import { getRooms } from "@/lib/supabase-rooms";
import { Upload, X, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface ItemFormProps {
  item?: (Item & { category_id?: string | null }) | null;
  labs?: Lab[];
  onSubmit: (payload: Omit<Item, "id" | "created_at">) => Promise<void> | void;
  onCancel: () => void;
  mode: "add" | "edit";
}

export default function ItemForm({
  item,
  onSubmit,
  onCancel,
  mode,
}: ItemFormProps) {
  const [name, setName] = useState(item?.name || "");
  const [code, setCode] = useState(item?.code || "");
  const [type, setType] = useState<"alat" | "bahan">(item?.type || "alat");
  const [categoryId, setCategoryId] = useState(
    (item as any)?.category_id || "",
  );
  const [unit, setUnit] = useState(item?.unit || "pcs");
  const [totalQty, setTotalQty] = useState<number>(item?.total_qty || 1);
  const [availableQty, setAvailableQty] = useState<number>(
    item?.available_qty || 1,
  );
  const [minStockAlert, setMinStockAlert] = useState<number>(
    item?.min_stock_alert || 5,
  );
  const [condition, setCondition] = useState(item?.condition || "baik");
  const [locationRack, setLocationRack] = useState(item?.location_rack || "");
  const [specsDetail, setSpecsDetail] = useState(item?.specs_detail || "");
  const [imageUrl, setImageUrl] = useState(item?.image_url || "");
  const [roomId, setRoomId] = useState(item?.room_id || "");

  // State Rooms & Categories
  const [rooms, setRooms] = useState<Room[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Upload & Submit state
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadInitialData() {
      try {
        const [roomsData, { data: catData }] = await Promise.all([
          getRooms(),
          supabase.from("categories").select("id, name").order("name"),
        ]);

        if (mounted) {
          setRooms(roomsData || []);
          setCategories(catData || []);

          if (!item?.room_id && roomsData && roomsData.length > 0) {
            setRoomId(roomsData[0].id);
          }
        }
      } catch (err) {
        console.error("Gagal memuat data opsi form:", err);
      } finally {
        if (mounted) setLoadingRooms(false);
      }
    }

    void loadInitialData();
    return () => {
      mounted = false;
    };
  }, [item]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `items/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("items")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("items")
        .getPublicUrl(filePath);
      setImageUrl(publicData.publicUrl);
    } catch (err) {
      console.error("Gagal mengunggah foto:", err);
      alert(
        "Gagal mengunggah gambar. Pastikan bucket 'items' sudah diset Public.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit({
        name,
        code: code.trim() || null,
        type,
        unit,
        total_qty: Number(totalQty),
        available_qty: Number(availableQty),
        min_stock_alert: Number(minStockAlert),
        condition,
        location_rack: locationRack.trim() || null,
        specs_detail: specsDetail.trim() || null,
        image_url: imageUrl.trim() || null,
        room_id: roomId || null,
        lab_id: item?.lab_id || null,
        category_id: categoryId || null,
        updated_at: new Date().toISOString(),
      } as any);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl my-8">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-800">
            {mode === "edit"
              ? "Edit Barang & Bahan"
              : "Tambah Barang & Bahan Baru"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Baris 1: Nama & Kode */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700">
                Nama Barang / Bahan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Ampelas"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700">
                Kode / Katalog
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Contoh: AMPL-01"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Baris 2: Ruangan & Kategori */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700">
                Pilih Ruangan <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                {loadingRooms ? (
                  <option value="">Memuat ruangan...</option>
                ) : rooms.length === 0 ? (
                  <option value="">Belum ada ruangan</option>
                ) : (
                  <>
                    <option value="">-- Pilih Ruangan --</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} {r.code ? `(${r.code})` : ""}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700">
                Kategori Barang
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Baris 3: Jenis, Satuan & Kondisi */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700">
                Jenis
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "alat" | "bahan")}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="alat">Alat</option>
                <option value="bahan">Bahan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700">
                Satuan
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Contoh: pcs, lembar, botol"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700">
                Kondisi
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="baik">Baik</option>
                <option value="rusak_ringan">Rusak Ringan</option>
                <option value="rusak_berat">Rusak Berat</option>
              </select>
            </div>
          </div>

          {/* Baris 4: Total Stok, Sisa Stok & Lokasi Rak */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700">
                Total Stok
              </label>
              <input
                type="number"
                min="0"
                value={totalQty}
                onChange={(e) => setTotalQty(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700">
                Stok Tersedia
              </label>
              <input
                type="number"
                min="0"
                value={availableQty}
                onChange={(e) => setAvailableQty(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700">
                Lokasi Rak / Lemari
              </label>
              <input
                type="text"
                value={locationRack}
                onChange={(e) => setLocationRack(e.target.value)}
                placeholder="Contoh: Lemari perkakas"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Upload Foto */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700">
              Foto Barang / Bahan
            </label>
            <div className="mt-1 flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>{uploading ? "Mengunggah..." : "Pilih File Foto"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              {imageUrl && (
                <div className="flex items-center gap-2">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-10 w-10 rounded border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Hapus Foto
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SOP / Deskripsi */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700">
              Keterangan / SOP / Prosedur Kerja
            </label>
            <textarea
              rows={3}
              value={specsDetail}
              onChange={(e) => setSpecsDetail(e.target.value)}
              placeholder="Rincian spesifikasi, bahan, atau SOP penggunaan..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
