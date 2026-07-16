import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyAdminPassword } from "@/lib/admin";

// Helper to generate key from title
const generateKey = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "_")
    .replace(/^-+|-+$/g, "");
};

// GET categories
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key) {
      const { data, error } = await supabaseServer
        .from("kategori_artikel")
        .select("*")
        .eq("key", key)
        .maybeSingle();

      if (error) throw error;
      return NextResponse.json({ kategori: data });
    }

    const { data, error } = await supabaseServer
      .from("kategori_artikel")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ kategori: data });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data kategori: " + error.message },
      { status: 500 }
    );
  }
}

// POST (create) category - Admin only
export async function POST(request) {
  try {
    if (!verifyAdminPassword(request.headers)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, subtitle, description } = await request.json();

    if (!title || !subtitle || !description) {
      return NextResponse.json(
        { error: "Judul, sub-judul, dan deskripsi kategori harus diisi" },
        { status: 400 }
      );
    }

    const key = generateKey(title);

    // Get max display order
    const { data: maxOrderData } = await supabaseServer
      .from("kategori_artikel")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1);

    const nextOrder = maxOrderData && maxOrderData[0] ? maxOrderData[0].display_order + 1 : 1;

    const { data, error } = await supabaseServer
      .from("kategori_artikel")
      .insert({ key, title, subtitle, description, display_order: nextOrder })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, kategori: data[0] });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menambahkan kategori: " + error.message },
      { status: 500 }
    );
  }
}

// PUT (update) category - Admin only
export async function PUT(request) {
  try {
    if (!verifyAdminPassword(request.headers)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, subtitle, description, display_order } = await request.json();

    if (!id || !title || !subtitle || !description) {
      return NextResponse.json(
        { error: "ID, judul, sub-judul, dan deskripsi kategori harus diisi" },
        { status: 400 }
      );
    }

    const key = generateKey(title);

    const { data, error } = await supabaseServer
      .from("kategori_artikel")
      .update({ key, title, subtitle, description, display_order })
      .eq("id", id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, kategori: data[0] });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengupdate kategori: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE category - Admin only
export async function DELETE(request) {
  try {
    if (!verifyAdminPassword(request.headers)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID kategori harus diisi" }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from("kategori_artikel")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus kategori: " + error.message },
      { status: 500 }
    );
  }
}
