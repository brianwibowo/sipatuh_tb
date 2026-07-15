import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: "Konfigurasi server bermasalah (ADMIN_PASSWORD belum diatur)." },
        { status: 500 }
      );
    }

    if (password === adminPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "Password salah, silakan coba lagi." },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Format request salah." },
      { status: 400 }
    );
  }
}
