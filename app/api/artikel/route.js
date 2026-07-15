import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyAdminPassword } from "@/lib/admin";

// Helper to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// GET article(s)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const penyebabId = searchParams.get("penyebab_card_id");

    if (slug) {
      const { data, error } = await supabaseServer
        .from("artikel")
        .select("*, penyebab_card(title, slug)")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return NextResponse.json({ artikel: data });
    }

    if (penyebabId) {
      const { data, error } = await supabaseServer
        .from("artikel")
        .select("*")
        .eq("penyebab_card_id", penyebabId)
        .maybeSingle();

      if (error) throw error;
      return NextResponse.json({ artikel: data });
    }

    // Default to listing all articles
    const { data, error } = await supabaseServer
      .from("artikel")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ artikels: data });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data artikel: " + error.message },
      { status: 500 }
    );
  }
}

// POST (create) article - Admin only
export async function POST(request) {
  try {
    if (!verifyAdminPassword(request.headers)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { penyebab_card_id, title, body, image_url } = await request.json();

    if (!penyebab_card_id || !title || !body) {
      return NextResponse.json(
        { error: "ID Penyebab, judul, dan isi artikel harus diisi" },
        { status: 400 }
      );
    }

    const slug = `${generateSlug(title)}-${Date.now().toString().slice(-4)}`;

    const { data, error } = await supabaseServer
      .from("artikel")
      .insert({ penyebab_card_id, title, slug, body, image_url })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, artikel: data[0] });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat artikel: " + error.message },
      { status: 500 }
    );
  }
}

// PUT (update) article - Admin only
export async function PUT(request) {
  try {
    if (!verifyAdminPassword(request.headers)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, body, image_url } = await request.json();

    if (!id || !title || !body) {
      return NextResponse.json(
        { error: "ID, judul, dan isi artikel harus diisi" },
        { status: 400 }
      );
    }

    const slug = `${generateSlug(title)}-${id.slice(0, 4)}`;

    const { data, error } = await supabaseServer
      .from("artikel")
      .update({ title, body, image_url, slug })
      .eq("id", id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, artikel: data[0] });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengupdate artikel: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE article - Admin only
export async function DELETE(request) {
  try {
    if (!verifyAdminPassword(request.headers)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID artikel harus diisi" }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from("artikel")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus artikel: " + error.message },
      { status: 500 }
    );
  }
}
