export interface Item {
  id: string;
  lab_id: string;
  room_id?: string | null;
  category_id?: string | null;
  name: string;
  code: string | null;
  type: "alat" | "bahan";
  total_qty: number;
  available_qty: number;
  unit: string; // Ubah menjadi string agar tidak error TS2345
  condition: "baik" | "rusak_ringan" | "rusak_berat";
  location_rack: string | null;
  min_stock_alert: number;
  specs_detail: string | null;
  image_url?: string | null;
  expired_date?: string | null;
  created_at: string;
  updated_at?: string | null;
}
