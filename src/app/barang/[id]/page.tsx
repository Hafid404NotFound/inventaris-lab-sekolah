"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, QrCode } from "lucide-react";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import { getItemById } from "@/lib/supabase-items";
import { Item } from "@/types/database";

type ItemDetail = Item & {
  labs?: { name: string; code?: string | null } | null;
  rooms?: { name: string; code: string | null } | null;
  categories?: { name: string } | null;
};

export default function ItemDetailPage() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQrOnly, setShowQrOnly] = useState(false);

  useEffect(() => {
    let mounted = true;
    getItemById(params.id)
      .then((data) => {
        if (mounted) setItem(data as ItemDetail);
      })
      .catch((error) => console.error("Error loading item:", error))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Memuat detail barang...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-slate-600">
        <p>Barang tidak ditemukan.</p>
        <Link href="/barang" className="text-emerald-700 hover:underline">
          Kembali ke daftar barang
        </Link>
      </div>
    );
  }

  const locationFull =
    [item.labs?.name, item.rooms?.name, item.location_rack]
      .filter(Boolean)
      .join(" - ") || "-";

  // URL yang akan dimasukkan ke dalam QR Code
  const qrTargetUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/barang/${item.id}`
      : `http://localhost:3000/barang/${item.id}`;

  return (
    <main className="min-h-screen bg-slate-100 p-4 lg:p-8">
      <div
        className={`mx-auto max-w-5xl space-y-6 ${showQrOnly ? "print-qr-only" : ""}`}
      >
        {/* Tombol Atas */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/barang"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-xs cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Cetak / Export PDF
          </button>
        </div>

        {/* Informasi Detail Barang */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="bg-slate-800 px-6 py-4 text-white">
            <h1 className="text-xl font-bold">{item.name}</h1>
          </div>

          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-[220px_1fr]">
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <span className="text-xs text-slate-400">
                    Foto belum tersedia
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <SpecRow label="Lokasi penyimpanan" value={locationFull} />
                <SpecRow label="Jenis barang" value={item.type} />
                <SpecRow label="Kategori" value={item.categories?.name} />
                <SpecRow label="Satuan" value={item.unit} />
                <SpecRow
                  label="Sisa stok"
                  value={`${item.available_qty ?? 0} ${item.unit || ""}`}
                />
                <SpecRow label="Kode / Katalog" value={item.code || "-"} />
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Keterangan &amp; Prosedur Kerja
              </h2>
              <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {item.specs_detail || "Belum ada rincian spesifikasi atau SOP."}
              </div>
            </div>
          </div>
        </section>

        {/* Kotak Stiker QR Code */}
        <section className="qr-print-area grid gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-xs md:grid-cols-[260px_1fr]">
          <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 p-4 text-center bg-slate-50/50">
            {/* CARA PANGGIL KOMPONEN: kirim qrTargetUrl ke prop value */}
            <QRCodeGenerator value={qrTargetUrl} size={180} level="H" />
            <p className="mt-3 text-sm font-bold text-slate-800">{item.name}</p>
            <p className="mt-1 text-xs text-slate-500 font-mono">
              {item.code || "-"}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">{locationFull}</p>
          </div>

          <div className="flex flex-col justify-center space-y-3 print:hidden">
            <h3 className="text-base font-semibold text-slate-800">
              Stiker Label QR Code
            </h3>
            <p className="text-sm text-slate-600">
              Cetak QR Code ini dan tempelkan langsung pada wadah atau fisik
              barang di laboratorium.
            </p>
            <ul className="list-inside list-disc text-xs text-slate-500 space-y-1">
              <li>Setiap kamera smartphone dapat langsung memindai QR ini.</li>
              <li>
                Hasil scan langsung mengarahkan ke halaman informasi &amp; SOP
                barang ini.
              </li>
            </ul>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowQrOnly((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 cursor-pointer"
              >
                <QrCode className="h-4 w-4" />
                {showQrOnly
                  ? "Tampilkan Seluruh Halaman"
                  : "Mode Cetak QR Saja"}
              </button>
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .print-qr-only > section:first-of-type {
            display: none !important;
          }
          .qr-print-area {
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </main>
  );
}

function SpecRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="grid grid-cols-[160px_1fr] items-center text-sm">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="rounded bg-slate-50 px-3 py-1.5 font-semibold text-slate-800 border border-slate-100">
        {value || "-"}
      </span>
    </div>
  );
}
