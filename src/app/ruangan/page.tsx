"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Printer, Lock } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { getRooms, createRoom } from "@/lib/supabase-rooms";
import { getLabById } from "@/lib/supabase-labs";
import { supabase } from "@/lib/supabase";
import { Room } from "@/types/database";

type RoomWithCount = Room & {
  items?: { count: number }[];
};

export default function RoomsPage() {
  const searchParams = useSearchParams();
  const paramLabId = searchParams.get("lab_id") || undefined;

  const { user } = useAuth();
  const [rooms, setRooms] = useState<RoomWithCount[]>([]);
  const [labData, setLabData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State Tambah Ruangan
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);

  // Target lab yang sedang dibuka
  const targetLabId = paramLabId || user?.lab_id || undefined;

  // Cek Hak Kepemilikan (Cocokkan lab_id, NUP, atau Nama Peserta)
  const isOwner = Boolean(
    user?.role === "super_admin" ||
    (user?.lab_id && targetLabId && user.lab_id === targetLabId) ||
    (user?.nup && labData?.code && labData.code.includes(user.nup)) ||
    (user?.nup && labData?.name && labData.name.includes(user.nup)) ||
    (user?.name &&
      labData?.name &&
      labData.name.toLowerCase().includes(user.name.toLowerCase())),
  );

  const fetchRoomData = async () => {
    try {
      setLoading(true);
      if (targetLabId) {
        const [roomsResponse, labResponse] = await Promise.all([
          getRooms(targetLabId),
          getLabById(targetLabId),
        ]);
        setRooms((roomsResponse || []) as RoomWithCount[]);
        setLabData(labResponse);

        // Jika lab ini cocok dengan NUP tapi participant_accounts.lab_id masih kosong, tautkan otomatis
        if (
          user?.nup &&
          (!user.lab_id || user.lab_id !== targetLabId) &&
          (labResponse?.code?.includes(user.nup) ||
            labResponse?.name?.includes(user.nup))
        ) {
          await supabase
            .from("participant_accounts")
            .update({ lab_id: targetLabId })
            .eq("nup", user.nup);

          const updatedUser = { ...user, lab_id: targetLabId };
          localStorage.setItem("inventorium_user", JSON.stringify(updatedUser));
        }
      } else {
        const roomsResponse = await getRooms();
        setRooms((roomsResponse || []) as RoomWithCount[]);
      }
    } catch (err) {
      console.error("Error loading rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRoomData();
  }, [paramLabId, user?.lab_id]);

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOwner) {
      alert(
        "Akses ditolak: Anda hanya dapat menambah ruangan pada laboratorium milik Anda sendiri.",
      );
      return;
    }

    if (!targetLabId) {
      alert("Lab ID tidak ditemukan.");
      return;
    }

    setSaving(true);
    try {
      await createRoom({
        lab_id: targetLabId,
        code: newCode.trim(),
        name: newName.trim(),
        description: newDesc.trim() || undefined,
      });

      setShowAddModal(false);
      setNewCode("");
      setNewName("");
      setNewDesc("");
      await fetchRoomData();
      alert("Ruangan berhasil ditambahkan!");
    } catch (err: any) {
      console.error("Error adding room:", err);
      alert(
        `Gagal menambahkan ruangan: ${err?.message || "Pastikan kode belum digunakan"}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/labs"
                className="p-2 rounded-lg hover:bg-slate-100 transition"
                aria-label="Kembali"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-800">
                    Data Ruangan
                  </h1>
                  {!isOwner && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
                      <Lock className="h-3 w-3" /> Mode Melihat (Read-Only)
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Ruangan pada{" "}
                  <span className="font-semibold text-slate-800">
                    {labData?.name || labData?.code || "Laboratorium"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm"
              >
                <Printer className="h-4 w-4" /> Export / Print
              </button>

              {/* Tombol Tambah Ruangan Muncul jika PEMILIK LAB */}
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition shadow-sm cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Tambah Ruangan
                </button>
              )}
            </div>
          </div>

          {/* Search Box */}
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Cari ruangan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Table Data Ruangan */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] table-fixed">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 w-16">
                      No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 w-44">
                      Kode Ruangan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 w-64">
                      Nama Ruangan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Keterangan
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 w-32">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        Memuat data ruangan...
                      </td>
                    </tr>
                  ) : filteredRooms.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        Belum ada data ruangan untuk laboratorium ini.
                      </td>
                    </tr>
                  ) : (
                    filteredRooms.map((room, index) => {
                      const itemCount = room.items?.[0]?.count ?? 0;
                      return (
                        <tr
                          key={room.id}
                          className="hover:bg-slate-50 transition"
                        >
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-slate-700">
                            {room.code || "-"}
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-800">
                            {room.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {room.description || "-"}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Link
                              href={`/barang?room_id=${room.id}`}
                              className="inline-block rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                            >
                              {itemCount} Barang
                            </Link>
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

        {/* Modal Tambah Ruangan */}
        {showAddModal && isOwner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="text-lg font-bold text-slate-800">
                Tambah Ruangan Baru
              </h2>
              <form onSubmit={handleAddRoom} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Kode Ruangan
                  </label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="Contoh: LAB-IPA-01"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Nama Ruangan
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Contoh: Ruang Praktikum"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Keterangan
                  </label>
                  <textarea
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Deskripsi ruangan..."
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? "Menyimpan..." : "Simpan Ruangan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}
