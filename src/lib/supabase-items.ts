import { supabase } from "@/lib/supabase";
import { Item } from "@/types/database";

export async function getItems(filters?: {
  room_id?: string;
  lab_id?: string;
}) {
  let query = supabase
    .from("items")
    .select("*, labs(name), rooms(id, name, code, lab_id), categories(name)");

  if (filters?.room_id) {
    query = query.eq("room_id", filters.room_id);
  }

  if (filters?.lab_id) {
    query = query.eq("lab_id", filters.lab_id);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getItemById(id: string) {
  const { data, error } = await supabase
    .from("items")
    .select("*, labs(name), rooms(name, code), categories(name)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createItem(item: any) {
  // 1. Bersihkan semua nilai string kosong ("") menjadi null agar tidak error Foreign Key
  const payloadToInsert: any = {
    name: item.name,
    code:
      item.code && String(item.code).trim() !== ""
        ? String(item.code).trim()
        : null,
    type: item.type || "alat",
    unit: item.unit || "pcs",
    total_qty: Number(item.total_qty) || 0,
    available_qty: Number(item.available_qty) || 0,
    min_stock_alert: Number(item.min_stock_alert) || 0,
    condition: item.condition || "baik",
    location_rack:
      item.location_rack && String(item.location_rack).trim() !== ""
        ? String(item.location_rack).trim()
        : null,
    specs_detail:
      item.specs_detail && String(item.specs_detail).trim() !== ""
        ? String(item.specs_detail).trim()
        : null,
    image_url:
      item.image_url && String(item.image_url).trim() !== ""
        ? String(item.image_url).trim()
        : null,
    room_id:
      item.room_id && String(item.room_id).trim() !== "" ? item.room_id : null,
    lab_id:
      item.lab_id && String(item.lab_id).trim() !== "" ? item.lab_id : null,
    updated_at: new Date().toISOString(),
  };

  if (item.expired_date && String(item.expired_date).trim() !== "") {
    payloadToInsert.expired_date = item.expired_date;
  }

  const { data, error } = await supabase
    .from("items")
    .insert([payloadToInsert])
    .select("*, labs(name), rooms(name, code), categories(name)")
    .single();

  if (error) {
    console.error("Detail Error Supabase:", error.message, error.details);
    throw new Error(error.message || "Gagal menyimpan item ke database");
  }

  return data;
}

export async function updateItem(id: string, updates: Partial<Item>) {
  const { data, error } = await supabase
    .from("items")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, labs(name), rooms(name, code), categories(name)")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteItem(id: string) {
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function updateItemStock(id: string, newAvailableQty: number) {
  const { data, error } = await supabase
    .from("items")
    .update({
      available_qty: newAvailableQty,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
