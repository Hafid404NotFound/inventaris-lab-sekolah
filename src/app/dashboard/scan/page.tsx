"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import {
  Camera,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
  ScanLine,
  Sparkles,
  Info,
  CheckCircle2,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import AuthGuard from "@/components/AuthGuard";

export default function ScanPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.error("Gagal menghentikan scanner:", err);
      }
    }
    setScanning(false);
  };

  const handleScanSuccess = async (decodedText: string) => {
    await stopScanner();
    setScannedResult(decodedText);

    if (decodedText.includes("/barang/")) {
      const parts = decodedText.split("/barang/");
      const itemId = parts[1]?.replace(/[^a-zA-Z0-9-]/g, "");
      if (itemId) {
        setTimeout(() => {
          router.push(`/barang/${itemId}`);
        }, 1200);
        return;
      }
    }

    if (
      decodedText.startsWith("http://") ||
      decodedText.startsWith("https://")
    ) {
      setTimeout(() => {
        window.location.href = decodedText;
      }, 1200);
    }
  };

  const startScanner = async () => {
    setScanError(null);
    setScannedResult(null);
    setScanning(true);

    setTimeout(async () => {
      const qrElement = document.getElementById("qr-reader");
      if (!qrElement) {
        setScanError("Komponen kamera tidak siap.");
        setScanning(false);
        return;
      }

      try {
        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        const config = {
          fps: 15,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => handleScanSuccess(decodedText),
          () => {},
        );
      } catch (err: any) {
        console.error("Gagal memulai scanner:", err);
        setScanError(
          err?.message ||
            "Tidak dapat mengakses kamera. Berikan izin akses kamera pada browser.",
        );
        setScanning(false);
      }
    }, 200);
  };

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, []);

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/labs"
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-2xs"
                aria-label="Kembali"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                    Smart QR Scanner
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    <Sparkles className="h-3 w-3" /> Auto Detect
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">
                  Pindai label inventaris untuk inspeksi cepat, stok opname, dan
                  SOP alat
                </p>
              </div>
            </div>
          </div>

          {/* Grid Layout 2 Kolom */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Kolom Kiri: Area Kamera / Viewport Scanner (7 Kolom) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-emerald-600" /> Scanner
                  Viewport
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    scanning
                      ? "bg-emerald-100 text-emerald-700 animate-pulse"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${scanning ? "bg-emerald-600" : "bg-slate-400"}`}
                  />
                  {scanning ? "Kamera Aktif" : "Standby"}
                </span>
              </div>

              {/* Viewport Frame */}
              <div className="relative aspect-square w-full max-w-md mx-auto rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-800 flex flex-col items-center justify-center p-2">
                {/* Elemen DOM Camera */}
                <div
                  id="qr-reader"
                  className={`w-full h-full rounded-xl overflow-hidden ${
                    scanning ? "block" : "hidden"
                  }`}
                />

                {/* Laser Animation Overlay saat scanning */}
                {scanning && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="relative w-64 h-64 border-2 border-emerald-400/60 rounded-2xl overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-scanner-laser" />
                    </div>
                  </div>
                )}

                {/* Tampilan Standby Saat Kamera Belum Dibuka */}
                {!scanning && !scannedResult && (
                  <div className="text-center p-6 text-white space-y-4">
                    <div className="mx-auto w-20 h-20 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shadow-inner text-emerald-400">
                      <ScanLine className="w-10 h-10 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-100">
                        Kamera Belum Aktif
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                        Klik tombol di bawah untuk mengaktifkan lensa pemindai
                        secara otomatis.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={startScanner}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition transform active:scale-95 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" /> Buka Kamera Sekarang
                    </button>
                  </div>
                )}

                {/* Hasil Sukses */}
                {scannedResult && !scanning && (
                  <div className="text-center p-6 text-white space-y-4 bg-slate-900/95 w-full h-full flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-100">
                        QR Code Terbaca!
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 font-mono break-all max-w-xs bg-slate-800 p-2 rounded-lg border border-slate-700">
                        {scannedResult}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={startScanner}
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 border border-slate-600 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Scan Ulang
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tombol Kontrol Saat Sedang Scanning */}
              {scanning && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={stopScanner}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 px-5 py-2 text-xs font-semibold text-red-600 transition cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" /> Matikan Kamera
                  </button>
                </div>
              )}

              {/* Alert Error */}
              {scanError && (
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-red-50 p-3.5 text-xs text-red-700 border border-red-200">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{scanError}</span>
                </div>
              )}
            </div>

            {/* Kolom Kanan: Panduan & Fitur Cepat (5 Kolom) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Card Panduan */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Info className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-800">
                    Petunjuk Pemindaian
                  </h3>
                </div>

                <ol className="space-y-3 text-xs text-slate-600">
                  <li className="flex gap-3 items-start">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      1
                    </span>
                    <span>
                      Pastikan ruangan memiliki pencahayaan yang cukup agar
                      barcode tidak buram.
                    </span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      2
                    </span>
                    <span>
                      Posisikan stiker QR barang tepat di dalam kotak fokus
                      kamera.
                    </span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      3
                    </span>
                    <span>
                      Sistem akan langsung membuka halaman rincian stok &amp;
                      SOP alat secara instan.
                    </span>
                  </li>
                </ol>
              </div>

              {/* Card Pintasan Navigasi */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-emerald-400">
                  Belum Punya Stiker QR?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Buka menu barang, klik tombol detail pada alat yang
                  diinginkan, lalu pilih <strong>Print QR Code</strong> untuk
                  mencetak stiker fisik.
                </p>
                <Link
                  href="/barang"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline pt-1"
                >
                  Buka Master Alat &amp; Bahan &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Laser Animation Keyframes */}
        <style jsx global>{`
          @keyframes scannerLaser {
            0% {
              top: 0%;
            }
            50% {
              top: 96%;
            }
            100% {
              top: 0%;
            }
          }
          .animate-scanner-laser {
            animation: scannerLaser 2s infinite ease-in-out;
          }
        `}</style>
      </DashboardLayout>
    </AuthGuard>
  );
}
