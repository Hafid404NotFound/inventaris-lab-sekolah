export type ItemType = "alat" | "bahan";
export type ItemCondition = "baik" | "rusak_ringan" | "rusak_berat";
export type LoanStatus = "dipinjam" | "kembali" | "rusak_hilang";
export type BorrowerRole =
  | "super_admin"
  | "kepala_lab"
  | "guru"
  | "siswa"
  | "guest";

export interface School {
  id: string;
  name: string;
  address: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface Lab {
  id: string;
  school_id: string;
  code?: string | null;
  name: string;
  category?: string | null;
  pic_name?: string | null;
  location?: string | null;
  description?: string | null;
  created_at: string;
}

export interface Room {
  id: string;
  lab_id: string;
  code?: string | null;
  name: string;
  description?: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  lab_id: string;
  room_id?: string | null;
  name: string;
  type: "asset" | "consumable";
  created_at: string;
}

export interface Loan {
  id: string;
  item_id: string;
  borrower_name: string;
  borrower_role: BorrowerRole;
  loan_date: string;
  return_date?: string | null;
  qty: number;
  status: LoanStatus;
  notes?: string | null;
  created_at: string;
}

export interface DashboardStats {
  totalItems: number;
  totalLabs: number;
  lowStockAlerts: number;
  activeLoans: number;
}

export interface Item {
  id: string;
  lab_id: string;
  room_id?: string | null;
  category_id?: string | null;
  name: string;
  code: string | null;
  type: ItemType;
  total_qty: number;
  available_qty: number;
  unit: string; // Ubah menjadi string agar tidak error TS2345
  condition: ItemCondition;
  location_rack: string | null;
  min_stock_alert: number;
  specs_detail: string | null;
  image_url?: string | null;
  expired_date?: string | null;
  created_at: string;
  updated_at?: string | null;
}
