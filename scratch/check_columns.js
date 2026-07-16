const { supabaseServer } = require("../lib/supabase-server");

async function check() {
  try {
    const { data: art, error: err1 } = await supabaseServer.from("artikel").select("*").limit(1);
    console.log("Artikel columns:", art ? Object.keys(art[0] || {}) : "No records", err1);

    const { data: card, error: err2 } = await supabaseServer.from("penyebab_card").select("*").limit(1);
    console.log("Penyebab columns:", card ? Object.keys(card[0] || {}) : "No records", err2);
    
    const { data: cat, error: err3 } = await supabaseServer.from("kategori_artikel").select("*").limit(1);
    console.log("Kategori columns:", cat ? Object.keys(cat[0] || {}) : "No records", err3);
  } catch (e) {
    console.error("Error", e);
  }
}

check();
