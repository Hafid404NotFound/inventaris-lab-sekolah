"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardStats, Lab } from "@/types/database";
import {
  Package,
  FlaskConical,
  AlertTriangle,
  TrendingUp,
  Clock,
} from "lucide-react";
import { getLabs } from "@/lib/supabase-labs";
import { getItems } from "@/lib/supabase-items";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    totalLabs: 0,
    lowStockAlerts: 0,
  });
  const [recentLabs, setRecentLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [labs, items] = await Promise.all([
          getLabs(),
          getItems(),
        ]);

        // Calculate stats
        const totalItems = items?.length || 0;
        const totalLabs = labs?.length || 0;
        const lowStockAlerts = items?.filter(
          (item: any) => item.available_qty <= item.min_stock_alert
        ).length || 0;
        setStats({
          totalItems,
          totalLabs,
          lowStockAlerts,
        });

        setRecentLabs(labs || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Set default values on error
        setStats({
          totalItems: 0,
          totalLabs: 0,
          lowStockAlerts: 0,
        });
        setRecentLabs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: "Total Item",
      value: stats.totalItems,
      icon: Package,
      color: "bg-blue-500",
      trend: "+12%",
    },
    {
      title: "Total Lab",
      value: stats.totalLabs,
      icon: FlaskConical,
      color: "bg-emerald-500",
      trend: "+0%",
    },
    {
      title: "Stok Menipis",
      value: stats.lowStockAlerts,
      icon: AlertTriangle,
      color: "bg-amber-500",
      trend: "+2",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Selamat datang, {user?.name}!
        </h1>
        <p className="text-slate-600 mt-1">
          Berikut adalah ringkasan aktivitas laboratorium hari ini.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-sm text-emerald-600">
                <TrendingUp className="w-4 h-4" />
                {stat.trend}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-sm text-slate-600 mt-1">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Labs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Laboratorium</h2>
          <p className="text-sm text-slate-600 mt-1">
            Daftar laboratorium di sekolah Anda
          </p>
        </div>
        <div className="divide-y divide-slate-200">
          {recentLabs.map((lab) => (
            <div
              key={lab.id}
              className="p-6 hover:bg-slate-50 transition cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <FlaskConical className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{lab.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {lab.category}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span>{lab.pic_name}</span>
                      <span>•</span>
                      <span>{lab.location}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>Aktif</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/dashboard/items"
            className="bg-white/20 hover:bg-white/30 transition rounded-lg p-4 text-center block"
          >
            <Package className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Tambah Item</span>
          </Link>
          <Link
            href="/dashboard/labs"
            className="bg-white/20 hover:bg-white/30 transition rounded-lg p-4 text-center block"
          >
            <FlaskConical className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Kelola Lab</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
