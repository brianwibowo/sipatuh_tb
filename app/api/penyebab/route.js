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
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const kategoriId = searchParams.get("kategori_id");
    const kategoriKey = searchParams.get("kategori_key");

    let query = supabaseServer
      .from("penyebab_card")
      .select("*, artikel(body)");

    if (kategoriId) {
      query = query.eq("kategori_id", kategoriId);
    } else if (kategoriKey) {
      // Find category first
      const { data: catData } = await supabaseServer
        .from("kategori_artikel")
        .select("id")
        .eq("key", kategoriKey)
        .maybeSingle();
      
      if (catData) {
        query = query.eq("kategori_id", catData.id);
      }
    }

    const { data, error } = await query.order("display_order", { ascending: true });

    if (error) throw error;

    // Flatten artikel body for easy consumption in UI
    const formatted = data.map(card => {
      let body = "";
      if (card.artikel) {
        if (Array.isArray(card.artikel)) {
          body = card.artikel[0]?.body || "";
        } else {
          body = card.artikel.body || "";
        }
      }
      return {
        ...card,
        article_body: body
      };
    });

    return NextResponse.json({ penyebab: formatted });
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

    const { title, description, image_url, kategori_id, article_body } = await request.json();

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

    // 1. Insert penyebab_card
    const { data: cardData, error: cardError } = await supabaseServer
      .from("penyebab_card")
      .insert({ title, description, image_url, slug, display_order: nextOrder, kategori_id })
      .select();

    if (cardError) throw cardError;
    const card = cardData[0];

    // 2. Insert corresponding artikel
    const { error: artError } = await supabaseServer
      .from("artikel")
      .insert({
        penyebab_card_id: card.id,
        title: card.title,
        slug: slug,
        body: article_body || `<p>${description}</p>`,
        image_url: image_url
      });

    if (artError) {
      // rollback card insert if article insert fails
      await supabaseServer.from("penyebab_card").delete().eq("id", card.id);
      throw artError;
    }

    return NextResponse.json({ success: true, penyebab: card });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menambahkan penyebab dan artikel: " + error.message },
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

    const { id, title, description, image_url, kategori_id, article_body } = await request.json();

    if (!id || !title) {
      return NextResponse.json({ error: "ID dan judul harus diisi" }, { status: 400 });
    }

    const slug = `${generateSlug(title)}-${id.slice(0, 4)}`;

    // 1. Update penyebab_card
    const { data: cardData, error: cardError } = await supabaseServer
      .from("penyebab_card")
      .update({ title, description, image_url, slug, kategori_id })
      .eq("id", id)
      .select();

    if (cardError) throw cardError;
    const card = cardData[0];

    // 2. Upsert corresponding artikel
    const { data: existingArt } = await supabaseServer
      .from("artikel")
      .select("id")
      .eq("penyebab_card_id", id)
      .maybeSingle();

    if (existingArt) {
      const { error: artError } = await supabaseServer
        .from("artikel")
        .update({
          title: card.title,
          slug: slug,
          body: article_body || `<p>${description}</p>`,
          image_url: image_url
        })
        .eq("id", existingArt.id);

      if (artError) throw artError;
    } else {
      const { error: artError } = await supabaseServer
        .from("artikel")
        .insert({
          penyebab_card_id: id,
          title: card.title,
          slug: slug,
          body: article_body || `<p>${description}</p>`,
          image_url: image_url
        });

      if (artError) throw artError;
    }

    return NextResponse.json({ success: true, penyebab: card });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengupdate penyebab dan artikel: " + error.message },
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

    // 1. Delete linked article first to prevent FK violation
    await supabaseServer.from("artikel").delete().eq("penyebab_card_id", id);

    // 2. Delete penyebab_card
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
