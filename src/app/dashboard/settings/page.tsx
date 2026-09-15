"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { getOrCreateDefaultSchool } from "@/lib/supabase-labs";
import {
  User,
  Building2,
  Bell,
  Shield,
  Database,
  Save,
  Mail,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [school, setSchool] = useState({
    name: "SMA Negeri 1 Jakarta",
    address: "Jl. Pendidikan No. 1, Jakarta Pusat",
    npsn: "",
    website: "",
    email: "",
  });
  const [notifications, setNotifications] = useState({
    stock_alert: true,
    expiring_items: true,
    loan_reminders: true,
    damage_reports: true,
    new_loans: true,
  });
  const [system, setSystem] = useState({
    language: "id",
    timezone: "Asia/Jakarta",
    dateFormat: "DD/MM/YYYY",
    theme: "light",
  });
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const isAdmin = user?.role === "super_admin" || user?.role === "kepala_lab";

  useEffect(() => {
    if (user && !isAdmin) router.replace("/dashboard");
  }, [isAdmin, router, user]);

  useEffect(() => {
    // Initialize settings from the authenticated user and local browser storage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfile({ name: user?.name || "", email: user?.email || "", phone: "" });
    const savedSettings = localStorage.getItem("inventorium_settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSchool((current) => ({ ...current, ...parsed.school }));
        setNotifications((current) => ({ ...current, ...parsed.notifications }));
        setSystem((current) => ({ ...current, ...parsed.system }));
        setProfile((current) => ({ ...current, ...parsed.profile }));
      } catch {
        localStorage.removeItem("inventorium_settings");
      }
    }

    if (!user) return;
    const loadDatabaseSettings = async () => {
      try {
        const schoolId = await getOrCreateDefaultSchool();
        const [{ data: schoolData }, { data: userSettings }] = await Promise.all([
          supabase
            .from("schools")
            .select("name, address, npsn, website, email")
            .eq("id", schoolId)
            .maybeSingle(),
          supabase
            .from("user_settings")
            .select("phone, notifications, system")
            .eq("user_id", user.id)
            .maybeSingle(),
        ]);

        if (schoolData) setSchool((current) => ({ ...current, ...schoolData }));
        if (userSettings) {
          setProfile((current) => ({ ...current, phone: userSettings.phone || "" }));
          setNotifications((current) => ({ ...current, ...(userSettings.notifications || {}) }));
          setSystem((current) => ({ ...current, ...(userSettings.system || {}) }));
        }
      } catch (error) {
        console.warn("Pengaturan Supabase belum tersedia, memakai penyimpanan lokal:", error);
      }
    };
    void loadDatabaseSettings();
  }, [user]);

  if (!user || !isAdmin) return null;

  const tabs = [
    { id: "profile", name: "Profil", icon: User },
    { id: "school", name: "Sekolah", icon: Building2 },
    { id: "notifications", name: "Notifikasi", icon: Bell },
    { id: "security", name: "Keamanan", icon: Shield },
    { id: "system", name: "Sistem", icon: Database },
  ];

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveMessage("");
    setErrorMessage("");

    try {
      const warnings: string[] = [];
      if (!profile.name.trim()) throw new Error("Nama lengkap wajib diisi.");
      if (security.newPassword || security.confirmPassword || security.currentPassword) {
        if (!security.currentPassword || !security.newPassword) {
          throw new Error("Password saat ini dan password baru wajib diisi.");
        }
        if (security.newPassword !== security.confirmPassword) {
          throw new Error("Konfirmasi password baru tidak cocok.");
        }
        if (security.newPassword.length < 6) {
          throw new Error("Password baru minimal 6 karakter.");
        }
        const { data: account } = await supabase
          .from("participant_accounts")
          .select("id")
          .eq("id", user.id)
          .eq("password", security.currentPassword)
          .maybeSingle();
        if (!account) throw new Error("Password saat ini salah.");
        const { error: passwordError } = await supabase
          .from("participant_accounts")
          .update({ password: security.newPassword })
          .eq("id", user.id);
        if (passwordError) throw passwordError;
      }

      const { error: profileError } = await supabase
        .from("participant_accounts")
        .update({ name: profile.name.trim(), email: profile.email.trim() || null })
        .eq("id", user.id);
      if (profileError) throw profileError;

      const schoolId = await getOrCreateDefaultSchool();
      const { error: schoolError } = await supabase
        .from("schools")
        .upsert({
          id: schoolId,
          name: school.name.trim() || "Sekolah",
          address: school.address.trim() || null,
          npsn: school.npsn.trim() || null,
          website: school.website.trim() || null,
          email: school.email.trim() || null,
        }, { onConflict: "id" });
      if (schoolError) {
        // Keep core school data working when the optional migration is not installed yet.
        const { error: fallbackSchoolError } = await supabase
          .from("schools")
          .upsert({
            id: schoolId,
            name: school.name.trim() || "Sekolah",
            address: school.address.trim() || null,
          }, { onConflict: "id" });
        if (fallbackSchoolError) throw fallbackSchoolError;
        warnings.push("Data NPSN, website, dan email sekolah menunggu migration Supabase.");
      }

      const { error: settingsError } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          phone: profile.phone.trim() || null,
          notifications,
          system,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      if (settingsError) {
        warnings.push("Preferensi telepon/notifikasi tersimpan di perangkat ini. Jalankan migration Supabase agar tersimpan lintas perangkat.");
      }

      const settings = { profile, school, notifications, system };
      localStorage.setItem("inventorium_settings", JSON.stringify(settings));
      localStorage.setItem("inventorium_user", JSON.stringify({ ...user, name: profile.name.trim(), email: profile.email.trim() || null }));
      updateUser({ name: profile.name.trim(), email: profile.email.trim() || null });
      setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSaveMessage(
        warnings.length > 0
          ? `Pengaturan tersimpan dengan catatan: ${warnings.join(" ")}`
          : "Pengaturan berhasil disimpan.",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Kesalahan tidak diketahui";
      setErrorMessage(`Pengaturan gagal disimpan: ${message}`);
    } finally {
      setSaving(false);
    }
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
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {errorMessage}
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
                    value={profile.name}
                    onChange={(event) => setProfile({ ...profile, name: event.target.value })}
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
                      value={profile.email}
                      onChange={(event) => setProfile({ ...profile, email: event.target.value })}
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
                      value={profile.phone}
                      onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
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
                    value={school.name}
                    onChange={(event) => setSchool({ ...school, name: event.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    NPSN
                  </label>
                  <input
                    type="text"
                    value={school.npsn}
                    onChange={(event) => setSchool({ ...school, npsn: event.target.value })}
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
                      value={school.address}
                      onChange={(event) => setSchool({ ...school, address: event.target.value })}
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
                      value={school.website}
                      onChange={(event) => setSchool({ ...school, website: event.target.value })}
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
                      value={school.email}
                      onChange={(event) => setSchool({ ...school, email: event.target.value })}
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
                        checked={notifications[item.id as keyof typeof notifications]}
                        onChange={(event) =>
                          setNotifications({
                            ...notifications,
                            [item.id]: event.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
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
                    value={security.currentPassword}
                    onChange={(event) => setSecurity({ ...security, currentPassword: event.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    value={security.newPassword}
                    onChange={(event) => setSecurity({ ...security, newPassword: event.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    value={security.confirmPassword}
                    onChange={(event) => setSecurity({ ...security, confirmPassword: event.target.value })}
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
                  <select value={system.language} onChange={(event) => setSystem({ ...system, language: event.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Zona Waktu
                  </label>
                  <select value={system.timezone} onChange={(event) => setSystem({ ...system, timezone: event.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                    <option value="Asia/Jakarta">WIB (UTC+7)</option>
                    <option value="Asia/Makassar">WITA (UTC+8)</option>
                    <option value="Asia/Jayapura">WIT (UTC+9)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Format Tanggal
                  </label>
                  <select value={system.dateFormat} onChange={(event) => setSystem({ ...system, dateFormat: event.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
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
                      onClick={() => setSystem({ ...system, theme: theme.id })}
                      className={`p-4 rounded-lg border-2 transition ${
                        theme.id === system.theme
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
                    <button
                      onClick={() => {
                        const blob = new Blob([JSON.stringify({ profile, school, notifications, system }, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = "inventorium-settings.json";
                        link.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
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
                    <button
                      onClick={() => {
                        if (window.confirm("Reset preferensi lokal? Data inventaris tidak akan dihapus.")) {
                          localStorage.removeItem("inventorium_settings");
                          setNotifications({ stock_alert: true, expiring_items: true, loan_reminders: true, damage_reports: true, new_loans: true });
                          setSystem({ language: "id", timezone: "Asia/Jakarta", dateFormat: "DD/MM/YYYY", theme: "light" });
                          setSaveMessage("Preferensi lokal berhasil direset.");
                        }
                      }}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
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
              disabled={saving}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
