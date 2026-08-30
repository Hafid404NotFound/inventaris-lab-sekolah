import { supabase } from "./supabase";
import { Loan, LoanStatus } from "@/types/database";

/**
 * Get all loans with optional filters
 */
export async function getLoans(filters?: {
  item_id?: string;
  status?: LoanStatus;
  borrower_role?: string;
}) {
  let query = supabase
    .from("loans")
    .select("*, items(name, code)")
    .order("loan_date", { ascending: false });

  if (filters?.item_id) {
    query = query.eq("item_id", filters.item_id);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.borrower_role) {
    query = query.eq("borrower_role", filters.borrower_role);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching loans:", error);
    throw error;
  }

  return data;
}

/**
 * Get active loans (status = 'dipinjam')
 */
export async function getActiveLoans() {
  const { data, error } = await supabase
    .from("loans")
    .select("*, items(name, code)")
    .eq("status", "dipinjam")
    .order("loan_date", { ascending: false });

  if (error) {
    console.error("Error fetching active loans:", error);
    throw error;
  }

  return data;
}

/**
 * Get loan by ID
 */
export async function getLoanById(id: string) {
  const { data, error } = await supabase
    .from("loans")
    .select("*, items(name, code)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching loan:", error);
    throw error;
  }

  return data;
}

/**
 * Create new loan
 */
export async function createLoan(loan: Pick<Loan, "item_id" | "borrower_name" | "borrower_role" | "qty"> &
  Partial<Pick<Loan, "loan_date" | "return_date" | "status" | "notes">>) {
  const { data, error } = await supabase
    .from("loans")
    .insert([
      {
        ...loan,
        loan_date: loan.loan_date || new Date().toISOString(),
        status: loan.status || "dipinjam",
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating loan:", error);
    throw error;
  }

  return data as Loan;
}

/**
 * Update existing loan
 */
export async function updateLoan(id: string, loan: Partial<Loan>) {
  const { data, error } = await supabase
    .from("loans")
    .update(loan)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating loan:", error);
    throw error;
  }

  return data as Loan;
}

/**
 * Delete loan
 */
export async function deleteLoan(id: string) {
  const { error } = await supabase.from("loans").delete().eq("id", id);

  if (error) {
    console.error("Error deleting loan:", error);
    throw error;
  }

  return true;
}

/**
 * Return a loan (mark as returned)
 */
export async function returnLoan(id: string) {
  const { data, error } = await supabase
    .from("loans")
    .update({
      status: "kembali",
      return_date: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error returning loan:", error);
    throw error;
  }

  return data as Loan;
}

/**
 * Get loan statistics
 */
export async function getLoanStats() {
  const { data, error } = await supabase
    .from("loans")
    .select("status");

  if (error) {
    console.error("Error fetching loan stats:", error);
    throw error;
  }

  const stats = {
    total: data?.length || 0,
    active: data?.filter((loan) => loan.status === "dipinjam").length || 0,
    returned: data?.filter((loan) => loan.status === "kembali").length || 0,
    lost: data?.filter((loan) => loan.status === "rusak_hilang").length || 0,
  };

  return stats;
}
