"use client";

import { useState, useEffect } from "react";
import { Lab } from "@/types/database";
import {
  createLab,
  deleteLab,
  getLabsWithRoomCount,
  getOrCreateDefaultSchool,
  updateLab,
} from "@/lib/supabase-labs";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  FlaskConical,
  Plus,
  Search,
  Edit,
  Trash2,
  Printer,
  Lock,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";

export default function LabsPage() {
  const { user } = useAuth();
  const [labs, setLabs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLab, setSelectedLab] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Flag anti-spam submit
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    pic_name: "",
    description: "",
  });

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      pic_name: "",
      description: "",
    });
  };

  const loadLabs = async () => {
    try {
      setLoading(true);
      const labsData = await getLabsWithRoomCount();
      setLabs(labsData || []);
    } catch (error) {
      console.error("Error loading labs:", error);
      setLabs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLabs();
  }, []);

  const isLabOwner = (lab: any) => {
    if (!user) return false;
    if (user.role === "super_admin") return true;
    return (
      (user.lab_id && lab.id === user.lab_id) ||
      (user.nup && lab.code && lab.code.includes(user.nup)) ||
      (user.nup && lab.name && lab.name.includes(user.nup))
    );
  };

  // Handler Tambah Lab dengan Anti-Spam
  const handleCreateLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const name = formData.name.trim();
    if (!name) {
      alert("Nama laboratorium wajib diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      const schoolId = await getOrCreateDefaultSchool();
      const labCode = formData.code.trim() || user?.nup || null;

      const newLab = await createLab({
        school_id: schoolId,
        code: labCode,
        name,
        pic_name: formData.pic_name.trim() || user?.name || null,
        description: formData.description.trim() || null,
      });

      if (user && newLab?.id) {
        await supabase
          .from("participant_accounts")
          .update({ lab_id: newLab.id })
          .eq("nup", user.nup);

        const updatedUser = { ...user, lab_id: newLab.id };
        localStorage.setItem("inventorium_user", JSON.stringify(updatedUser));
      }

      setShowAddModal(false);
      resetForm();
      await loadLabs();
      alert("Laboratorium berhasil ditambahkan dan ditautkan ke akun Anda!");
    } catch (error) {
      console.error("Error creating lab:", error);
      alert(
        `Gagal menambahkan laboratorium: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditLab = (lab: any) => {
    if (!isLabOwner(lab)) {
      alert(
        "Akses ditolak: Anda hanya dapat mengedit laboratorium milik Anda sendiri.",
      );
      return;
    }

    setSelectedLab(lab);
    setFormData({
      code: lab.code || "",
      name: lab.name,
      pic_name: lab.pic_name || "",
      description: lab.description || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!selectedLab || !isLabOwner(selectedLab)) {
      alert(
        "Akses ditolak: Anda tidak memiliki izin untuk mengedit laboratorium ini.",
      );
      return;
    }

    const name = formData.name.trim();
    if (!name) {
      alert("Nama laboratorium wajib diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateLab(selectedLab.id, {
        code: formData.code.trim() || null,
        name,
        pic_name: formData.pic_name.trim() || null,
        description: formData.description.trim() || null,
      });

      setShowEditModal(false);
      setSelectedLab(null);
      resetForm();
      await loadLabs();
      alert("Laboratorium berhasil diperbarui");
    } catch (error) {
      console.error("Error updating lab:", error);
      alert(
        `Gagal memperbarui laboratorium: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLab = async () => {
    if (isSubmitting) return;

    if (!selectedLab || !isLabOwner(selectedLab)) {
      alert(
        "Akses ditolak: Anda tidak memiliki izin untuk menghapus laboratorium ini.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await deleteLab(selectedLab.id);
      setLabs((prev) => prev.filter((lab) => lab.id !== selectedLab.id));
      setShowDeleteModal(false);
      setSelectedLab(null);
      alert("Laboratorium berhasil dihapus");
    } catch (error) {
      console.error("Error deleting lab:", error);
      alert("Gagal menghapus laboratorium");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLabs = labs.filter(
    (lab) =>
      lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.pic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredLabs.length / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedLabs = filteredLabs.slice(startIndex, endIndex);

  const getRoomCount = (lab: any) => {
    return lab.rooms?.[0]?.count || 0;
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("DATA LABORATORIUM", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("Daftar Laboratorium Sekolah", 105, 28, { align: "center" });
    doc.setFontSize(10);
    doc.text(
      `Tanggal: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
      105,
      35,
      { align: "center" },
    );

    const tableData = filteredLabs.map((lab, index) => [
      index + 1,
      lab.code || `LAB-${lab.id.slice(0, 8).toUpperCase()}`,
      lab.name,
      lab.description || lab.pic_name || "-",
      `${getRoomCount(lab)} Ruangan`,
    ]);

    autoTable(doc, {
      head: [["No", "Kode Lab", "Nama Lab", "Keterangan", "Jumlah Ruangan"]],
      body: tableData,
      startY: 45,
      headStyles: { fillColor: [5, 150, 105], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 25 },
        2: { cellWidth: 40 },
        3: { cellWidth: 60 },
        4: { cellWidth: 25 },
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Total Lab: ${filteredLabs.length}`, 14, finalY);
    doc.text(
      `Total Ruangan: ${filteredLabs.reduce((sum, lab) => sum + getRoomCount(lab), 0)}`,
      14,
      finalY + 7,
    );

    doc.save(`Data_Laboratorium_${new Date().toISOString().split("T")[0]}.pdf`);
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
          <h1 className="text-2xl font-bold text-slate-800">Data Lab</h1>
          <p className="text-slate-600 mt-1">
            Kelola data laboratorium sekolah peserta diklat
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToPDF}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <Printer className="w-5 h-5" />
            <span>Export to PDF</span>
          </button>

          <button
            onClick={() => {
              setFormData({
                code: user?.nup || "",
                name: user?.name ? `Lab ${user.name}` : "",
                pic_name: user?.name || "",
                description: "",
              });
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Lab</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Show</label>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={filteredLabs.length}>All</option>
            </select>
            <label className="text-sm text-slate-600">entries</label>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Tabel Lab */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-r border-slate-200 w-16">
                  No
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-r border-slate-200 w-36">
                  Kode Lab
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-r border-slate-200">
                  Nama Lab
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-r border-slate-200">
                  Keterangan
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-36">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedLabs.map((lab, index) => {
                const isOwner = isLabOwner(lab);

                return (
                  <tr key={lab.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm text-slate-500 border-r border-slate-200">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600 border-r border-slate-200">
                      {lab.code || `LAB-${lab.id.slice(0, 8).toUpperCase()}`}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 border-r border-slate-200">
                      {lab.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 border-r border-slate-200">
                      {lab.description ||
                        `${lab.pic_name || ""} ${lab.location || ""}`.trim() ||
                        "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/ruangan?lab_id=${lab.id}`}
                          className="inline-flex items-center rounded bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 border border-emerald-300"
                        >
                          {getRoomCount(lab)} Ruangan
                        </Link>

                        {isOwner ? (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditLab(lab)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900"
                              title={`Edit ${lab.name}`}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLab(lab);
                                setShowDeleteModal(true);
                              }}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
                              title={`Hapus ${lab.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span
                            className="p-1.5 text-slate-300"
                            title="Read-Only (Milik Peserta Lain)"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-slate-600">
            Showing {filteredLabs.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(endIndex, filteredLabs.length)} of {filteredLabs.length}{" "}
            entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded text-sm ${
                  currentPage === page
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "border-slate-300 hover:bg-slate-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal Tambah Lab */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Tambah Laboratorium Baru
            </h2>
            <form className="space-y-4" onSubmit={handleCreateLab}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kode Lab / NUP
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, code: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="Contoh: 44008"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Lab / Sekolah
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="Contoh: Lab SMAN 1 Tuban (Anggun)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Penanggung Jawab
                </label>
                <input
                  type="text"
                  value={formData.pic_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pic_name: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="Nama Kepala Lab / Peserta"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Keterangan Tambahan
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  rows={3}
                  placeholder="Keterangan laboratorium..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan &amp; Tautkan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Lab */}
      {showEditModal && selectedLab && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Edit Laboratorium
            </h2>
            <form className="space-y-4" onSubmit={handleUpdateLab}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kode Lab
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, code: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Lab
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Penanggung Jawab
                </label>
                <input
                  type="text"
                  value={formData.pic_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pic_name: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Keterangan
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedLab(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memperbarui...</span>
                    </>
                  ) : (
                    <span>Simpan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete Lab */}
      {showDeleteModal && selectedLab && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Hapus Laboratorium
            </h2>
            <p className="text-slate-600 mb-6">
              Apakah Anda yakin ingin menghapus{" "}
              <span className="font-semibold text-slate-800">
                {selectedLab.name}
              </span>
              ?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedLab(null);
                }}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteLab}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Hapus</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
