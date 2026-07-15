import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyAdminPassword } from "@/lib/admin";

// GET all content
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("petugas_content")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ contents: data });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data konten: " + error.message },
      { status: 500 }
    );
  }
}

// PUT (update) content - Admin only
export async function PUT(request) {
  try {
    if (!verifyAdminPassword(request.headers)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, body } = await request.json();

    if (!id || !title || !body) {
      return NextResponse.json(
        { error: "ID, judul, dan isi konten harus diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("petugas_content")
      .update({ title, body })
      .eq("id", id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, content: data[0] });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengupdate konten: " + error.message },
      { status: 500 }
    );
  }
}
