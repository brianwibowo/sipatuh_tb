import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyAdminPassword } from "@/lib/admin";

export async function POST(request) {
  try {
    // 1. Verify admin
    if (!verifyAdminPassword(request.headers)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan dalam request" }, { status: 400 });
    }

    const filename = file.name;
    const fileExtension = filename.split(".").pop();
    const cleanFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;

    // 3. Convert file to ArrayBuffer/Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Upload to Supabase Storage
    const { data, error } = await supabaseServer.storage
      .from("images")
      .upload(cleanFilename, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) throw error;

    // 5. Generate public URL
    const { data: publicUrlData } = supabaseServer.storage
      .from("images")
      .getPublicUrl(cleanFilename);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengupload gambar: " + error.message },
      { status: 500 }
    );
  }
}
