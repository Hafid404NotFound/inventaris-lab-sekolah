export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string
          name: string
          address: string | null
          logo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          logo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          logo_url?: string | null
          created_at?: string
        }
      }
      labs: {
        Row: {
          id: string
          school_id: string
          code?: string | null
          name: string
          category: string | null
          pic_name: string | null
          location: string | null
          description?: string | null
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          code?: string | null
          name: string
          category?: string | null
          pic_name?: string | null
          location?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          code?: string | null
          name?: string
          category?: string | null
          pic_name?: string | null
          location?: string | null
          description?: string | null
          created_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          lab_id: string
          code: string | null
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lab_id: string
          code?: string | null
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lab_id?: string
          code?: string | null
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          lab_id: string
          name: string
          type: 'asset' | 'consumable'
          created_at: string
        }
        Insert: {
          id?: string
          lab_id: string
          name: string
          type: 'asset' | 'consumable'
          created_at?: string
        }
        Update: {
          id?: string
          lab_id?: string
          name?: string
          type?: 'asset' | 'consumable'
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          lab_id: string
          room_id?: string | null
          category_id: string | null
          name: string
          code: string | null
          type: 'alat' | 'bahan'
          total_qty: number
          available_qty: number
          unit: 'pcs' | 'ml' | 'gr' | 'box' | 'set' | 'pak' | 'liter' | 'pack' | null
          condition: 'baik' | 'rusak_ringan' | 'rusak_berat'
          location_rack: string | null
          expired_date: string | null
          min_stock_alert: number
          specs_detail: string | null
          sop?: string | null
          image_url: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          lab_id: string
          room_id?: string | null
          category_id?: string | null
          name: string
          code?: string | null
          type: 'alat' | 'bahan'
          total_qty?: number
          available_qty?: number
          unit?: 'pcs' | 'ml' | 'gr' | 'box' | 'set' | 'pak' | 'liter' | 'pack' | null
          condition?: 'baik' | 'rusak_ringan' | 'rusak_berat'
          location_rack?: string | null
          expired_date?: string | null
          min_stock_alert?: number
          specs_detail?: string | null
          sop?: string | null
          image_url?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          lab_id?: string
          room_id?: string | null
          category_id?: string | null
          name?: string
          code?: string | null
          type?: 'alat' | 'bahan'
          total_qty?: number
          available_qty?: number
          unit?: 'pcs' | 'ml' | 'gr' | 'box' | 'set' | 'pak' | 'liter' | 'pack' | null
          condition?: 'baik' | 'rusak_ringan' | 'rusak_berat'
          location_rack?: string | null
          expired_date?: string | null
          min_stock_alert?: number
          specs_detail?: string | null
          sop?: string | null
          image_url?: string | null
          updated_at?: string
          created_at?: string
        }
      }
      loans: {
        Row: {
          id: string
          item_id: string
          borrower_name: string
          borrower_role: 'super_admin' | 'kepala_lab' | 'guru' | 'siswa' | 'guest'
          loan_date: string
          return_date: string | null
          qty: number
          status: 'dipinjam' | 'kembali' | 'rusak_hilang'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          borrower_name: string
          borrower_role: 'super_admin' | 'kepala_lab' | 'guru' | 'siswa' | 'guest'
          loan_date?: string
          return_date?: string | null
          qty?: number
          status?: 'dipinjam' | 'kembali' | 'rusak_hilang'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          borrower_name?: string
          borrower_role?: 'super_admin' | 'kepala_lab' | 'guru' | 'siswa' | 'guest'
          loan_date?: string
          return_date?: string | null
          qty?: number
          status?: 'dipinjam' | 'kembali' | 'rusak_hilang'
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Additional types for the application
export type School = Database['public']['Tables']['schools']['Row']
export type Lab = Database['public']['Tables']['labs']['Row']
export type Room = Database['public']['Tables']['rooms']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Item = Database['public']['Tables']['items']['Row']
export type Loan = Database['public']['Tables']['loans']['Row']

export type UserRole = 'super_admin' | 'kepala_lab' | 'guru' | 'siswa' | 'guest'
export type ItemType = 'alat' | 'bahan'
export type ItemCondition = 'baik' | 'rusak_ringan' | 'rusak_berat'
export type ItemUnit = 'pcs' | 'ml' | 'gr' | 'box' | 'set' | 'pak' | 'liter' | 'pack'
export type CategoryType = 'asset' | 'consumable'
export type LoanStatus = 'dipinjam' | 'kembali' | 'rusak_hilang'

export interface DashboardStats {
  totalItems: number
  totalLabs: number
  lowStockAlerts: number
  activeLoans: number
}

export interface LabWithStats extends Lab {
  items_count?: number
  categories_count?: number
}