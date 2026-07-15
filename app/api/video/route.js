import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyAdminPassword } from "@/lib/admin";

// GET videos
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active_only") === "true";

    let query = supabaseServer.from("video_pasien").select("*");

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query.order("display_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ videos: data });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data video: " + error.message },
      { status: 500 }
    );
  }
}

// POST (create) video - Admin only
export async function POST(request) {
  try {
    if (!verifyAdminPassword(request.headers)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, embed_url } = await request.json();

    if (!title || !embed_url) {
      return NextResponse.json(
        { error: "Judul dan URL video harus diisi" },
        { status: 400 }
      );
    }

    // Get max display order
    const { data: maxOrderData } = await supabaseServer
      .from("video_pasien")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1);

    const nextOrder = maxOrderData && maxOrderData[0] ? maxOrderData[0].display_order + 1 : 1;

    const { data, error } = await supabaseServer
      .from("video_pasien")
      .insert({ title, embed_url, display_order: nextOrder, is_active: true })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, video: data[0] });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menambahkan video: " + error.message },
      { status: 500 }
    );
  }
}

// PUT (update / toggle active) video - Admin only
export async function PUT(request) {
  try {
    if (!verifyAdminPassword(request.headers)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, embed_url, is_active } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID video harus diisi" }, { status: 400 });
    }

    // Prepare update payload dynamically based on input
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (embed_url !== undefined) updateData.embed_url = embed_url;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabaseServer
      .from("video_pasien")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, video: data[0] });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengupdate video: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE video - Admin only
export async function DELETE(request) {
  try {
    if (!verifyAdminPassword(request.headers)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID video harus diisi" }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from("video_pasien")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus video: " + error.message },
      { status: 500 }
    );
  }
}
