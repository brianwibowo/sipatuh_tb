import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyAdminPassword } from "@/lib/admin";

// Helper to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// GET all penyebab cards
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("penyebab_card")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ penyebab: data });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data penyebab: " + error.message },
      { status: 500 }
    );
  }
}

// POST (create) penyebab card - Admin only
export async function POST(request) {
  try {
    if (!verifyAdminPassword(request.headers)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, image_url } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Judul harus diisi" }, { status: 400 });
    }

    const slug = `${generateSlug(title)}-${Date.now().toString().slice(-4)}`;

    // Get max display order
    const { data: maxOrderData } = await supabaseServer
      .from("penyebab_card")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1);

    const nextOrder = maxOrderData && maxOrderData[0] ? maxOrderData[0].display_order + 1 : 1;

    const { data, error } = await supabaseServer
      .from("penyebab_card")
      .insert({ title, description, image_url, slug, display_order: nextOrder })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, penyebab: data[0] });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menambahkan penyebab: " + error.message },
      { status: 500 }
    );
  }
}

// PUT (update) penyebab card - Admin only
export async function PUT(request) {
  try {
    if (!verifyAdminPassword(request.headers)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, description, image_url } = await request.json();

    if (!id || !title) {
      return NextResponse.json({ error: "ID dan judul harus diisi" }, { status: 400 });
    }

    const slug = `${generateSlug(title)}-${id.slice(0, 4)}`;

    const { data, error } = await supabaseServer
      .from("penyebab_card")
      .update({ title, description, image_url, slug })
      .eq("id", id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, penyebab: data[0] });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengupdate penyebab: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE penyebab card - Admin only
export async function DELETE(request) {
  try {
    if (!verifyAdminPassword(request.headers)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID harus diisi" }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from("penyebab_card")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus penyebab: " + error.message },
      { status: 500 }
    );
  }
}
