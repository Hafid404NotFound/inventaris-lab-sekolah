import { supabase } from "@/lib/supabase";
import { Room } from "@/types/database";

export type RoomWithLab = Room & {
  labs?: { id: string; name: string; code: string | null } | null;
  items?: { count: number }[];
};

// 1. Get Rooms (Gunakan labId parameter jika ada, fallback ke user aktif)
export async function getRooms(labId?: string) {
  let targetLabId = labId;

  if (!targetLabId && typeof window !== "undefined") {
    const saved = localStorage.getItem("inventorium_user");
    if (saved) {
      try {
        const user = JSON.parse(saved);
        targetLabId = user?.lab_id;
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }
  }

  let query = supabase
    .from("rooms")
    .select("*, labs(id, name, code), items(count)");

  // Filter tepat berdasarkan Lab yang diminta
  if (targetLabId) {
    query = query.eq("lab_id", targetLabId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching rooms:", error);
    throw error;
  }
  return data as RoomWithLab[];
}

// 2. Get Single Room By ID
export async function getRoomById(id: string) {
  const { data, error } = await supabase
    .from("rooms")
    .select("*, labs(id, name, code)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching room by id:", error);
    throw error;
  }
  return data;
}

// 3. Create Room
export async function createRoom(room: Partial<Room>) {
  if (!room.lab_id) {
    throw new Error(
      "Akses ditolak: lab_id wajib disertakan saat membuat ruangan.",
    );
  }

  const { data, error } = await supabase
    .from("rooms")
    .insert([room])
    .select()
    .single();

  if (error) {
    console.error("Error creating room:", error);
    throw error;
  }
  return data;
}

// 4. Update Room
export async function updateRoom(id: string, updates: Partial<Room>) {
  const { data, error } = await supabase
    .from("rooms")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating room:", error);
    throw error;
  }
  return data;
}

// 5. Delete Room
export async function deleteRoom(id: string) {
  const { error } = await supabase.from("rooms").delete().eq("id", id);
  if (error) {
    console.error("Error deleting room:", error);
    throw error;
  }
  return true;
}
