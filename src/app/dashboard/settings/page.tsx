"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Settings,
  User,
  Building2,
  Bell,
  Shield,
  Database,
  Palette,
  Save,
  Camera,
  Mail,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [saveMessage, setSaveMessage] = useState("");

  const tabs = [
    { id: "profile", name: "Profil", icon: User },
    { id: "school", name: "Sekolah", icon: Building2 },
    { id: "notifications", name: "Notifikasi", icon: Bell },
    { id: "security", name: "Keamanan", icon: Shield },
    { id: "system", name: "Sistem", icon: Database },
  ];

  const handleSave = () => {
    setSaveMessage("Pengaturan berhasil disimpan!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan</h1>
        <p className="text-slate-600 mt-1">
          Kelola pengaturan akun dan aplikasi
        </p>
      </div>

      {/* Success Message */}
      {saveMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg">
          {saveMessage}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-emerald-600 border-b-2 border-emerald-600"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-emerald-600">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <button className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 transition">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {user?.name}
                  </h3>
                  <p className="text-slate-600 capitalize">
                    {user?.role?.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="email"
                      defaultValue={user?.email ?? ""}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    No. Telepon
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="tel"
                      placeholder="+62 xxx xxxx xxxx"
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={user?.role?.replace("_", " ").toUpperCase()}
                    disabled
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* School Tab */}
          {activeTab === "school" && (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                    <Building2 className="w-8 h-8 text-slate-400" />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 transition">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Logo Sekolah
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Format: PNG, JPG (Max 2MB)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nama Sekolah
                  </label>
                  <input
                    type="text"
                    defaultValue="SMA Negeri 1 Jakarta"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    NPSN
                  </label>
                  <input
                    type="text"
                    placeholder="Nomor Pokok Sekolah Nasional"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Alamat
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <textarea
                      rows={3}
                      defaultValue="Jl. Pendidikan No. 1, Jakarta Pusat"
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="url"
                      placeholder="https://sekolah.sch.id"
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Sekolah
                  </label>
                  <input
                    type="email"
                    placeholder="info@sekolah.sch.id"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h3 className="font-semibold text-slate-800">
                Preferensi Notifikasi
              </h3>

              <div className="space-y-4">
                {[
                  {
                    id: "stock_alert",
                    label: "Peringatan Stok Menipis",
                    description:
                      "Dapatkan notifikasi saat item mencapai minimum stok",
                  },
                  {
                    id: "expiring_items",
                    label: "Item Kadaluarsa",
                    description:
                      "Dapatkan notifikasi untuk item yang akan kadaluarsa",
                  },
                  {
                    id: "loan_reminders",
                    label: "Pengingat Peminjaman",
                    description:
                      "Dapatkan pengingat untuk peminjaman yang belum dikembalikan",
                  },
                  {
                    id: "damage_reports",
                    label: "Laporan Kerusakan",
                    description:
                      "Dapatkan notifikasi saat ada laporan kerusakan",
                  },
                  {
                    id: "new_loans",
                    label: "Peminjaman Baru",
                    description: "Dapatkan notifikasi saat ada peminjaman baru",
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{item.label}</p>
                      <p className="text-sm text-slate-600">
                        {item.description}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <h3 className="font-semibold text-slate-800">Keamanan Akun</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password Saat Ini
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h4 className="font-medium text-slate-800 mb-4">Sesi Aktif</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-800">
                        Chrome di Windows
                      </p>
                      <p className="text-sm text-slate-600">
                        Jakarta, Indonesia • Aktif sekarang
                      </p>
                    </div>
                    <span className="text-sm text-emerald-600 font-medium">
                      Sesi ini
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-800">
                        Firefox di Android
                      </p>
                      <p className="text-sm text-slate-600">
                        Jakarta, Indonesia • 2 hari lalu
                      </p>
                    </div>
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === "system" && (
            <div className="space-y-6">
              <h3 className="font-semibold text-slate-800">
                Pengaturan Sistem
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Bahasa
                  </label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Zona Waktu
                  </label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                    <option value="Asia/Jakarta">WIB (UTC+7)</option>
                    <option value="Asia/Makassar">WITA (UTC+8)</option>
                    <option value="Asia/Jayapura">WIT (UTC+9)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Format Tanggal
                  </label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h4 className="font-medium text-slate-800 mb-4">Tema</h4>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      id: "light",
                      name: "Terang",
                      bg: "bg-white border-slate-300",
                    },
                    {
                      id: "dark",
                      name: "Gelap",
                      bg: "bg-slate-800 border-slate-700",
                    },
                    {
                      id: "auto",
                      name: "Otomatis",
                      bg: "bg-gradient-to-r from-white to-slate-800 border-slate-300",
                    },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      className={`p-4 rounded-lg border-2 transition ${
                        theme.id === "light"
                          ? "border-emerald-500"
                          : "border-transparent"
                      }`}
                    >
                      <div className={`w-full h-12 rounded ${theme.bg} mb-2`} />
                      <p className="text-sm font-medium text-slate-800">
                        {theme.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h4 className="font-medium text-slate-800 mb-4">Database</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-800">Export Data</p>
                      <p className="text-sm text-slate-600">
                        Download semua data dalam format JSON
                      </p>
                    </div>
                    <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                      Export
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-800">Reset Data</p>
                      <p className="text-sm text-red-600">
                        Hapus semua data dan reset ke default
                      </p>
                    </div>
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-6 border-t border-slate-200">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition"
            >
              <Save className="w-5 h-5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
