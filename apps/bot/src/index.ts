import "dotenv/config";
import express from "express";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

const port = Number(process.env.PORT || 3000);
const botToken = process.env.BOT_TOKEN || "";
const webhookSecret = process.env.BOT_WEBHOOK_SECRET || "";
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!botToken) {
  console.warn("BOT_TOKEN is missing.");
}
if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Supabase credentials are missing.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function sendMessage(chatId: number, text: string) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}

async function getCategories() {
  const { data, error } = await supabase
    .from("products")
    .select("category")
    .not("category", "is", null);

  if (error) {
    console.warn("Failed to load categories", error.message);
    return [] as string[];
  }

  const categories = Array.from(new Set(data.map((row) => row.category || "")));
  return categories.filter((c) => c.trim().length > 0);
}

async function getCatalog() {
  const { data, error } = await supabase
    .from("products")
    .select("id,name,price,stock")
    .order("name", { ascending: true });

  if (error) {
    console.warn("Failed to load catalog", error.message);
    return [] as { id: string; name: string; price: number; stock: number }[];
  }

  return data as { id: string; name: string; price: number; stock: number }[];
}

async function ensureCustomer(telegramId: number, username?: string) {
  const { data } = await supabase
    .from("customers")
    .select("id")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  if (data?.id) return data.id as string;

  const { data: created, error } = await supabase
    .from("customers")
    .insert({ telegram_id: telegramId, username })
    .select("id")
    .single();

  if (error) {
    console.warn("Failed to create customer", error.message);
    return null;
  }

  return created.id as string;
}

async function createOrder(customerId: string, productId: string) {
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id,name,price,stock")
    .eq("id", productId)
    .single();

  if (productError || !product) {
    return { ok: false, message: "Produk tidak ditemukan." };
  }

  if (product.stock <= 0) {
    return { ok: false, message: "Stok habis. Silakan pilih produk lain." };
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      product_id: productId,
      amount: product.price,
      status: "pending"
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { ok: false, message: "Gagal membuat pesanan." };
  }

  return {
    ok: true,
    message: `Pesanan dibuat. ID: ${order.id}.\nSilakan lakukan pembayaran.`
  };
}

function isValidWebhook(req: express.Request) {
  if (!webhookSecret) return true;
  const header = req.header("x-telegram-bot-api-secret-token");
  return header === webhookSecret;
}

app.post("/webhook", async (req, res) => {
  if (!isValidWebhook(req)) {
    res.status(401).send("Unauthorized");
    return;
  }

  const message = req.body?.message;
  const chatId = message?.chat?.id;
  const text: string = message?.text || "";
  const username: string | undefined = message?.from?.username;
  const telegramId: number | undefined = message?.from?.id;

  if (!chatId || !telegramId) {
    res.status(200).send("ignored");
    return;
  }

  if (text.startsWith("/start")) {
    const categories = await getCategories();
    const reply = categories.length
      ? `Kategori tersedia:\n- ${categories.join("\n- ")}`
      : "Belum ada kategori. Hubungi admin.";
    await sendMessage(chatId, `Selamat datang!\n${reply}`);
    res.status(200).send("ok");
    return;
  }

  if (text.startsWith("/katalog")) {
    const catalog = await getCatalog();
    if (catalog.length === 0) {
      await sendMessage(chatId, "Katalog masih kosong.");
      res.status(200).send("ok");
      return;
    }
    const lines = catalog.map(
      (item) => `${item.name} | Rp${item.price} | Stok ${item.stock}`
    );
    await sendMessage(chatId, `Daftar produk:\n${lines.join("\n")}`);
    res.status(200).send("ok");
    return;
  }

  if (text.startsWith("/order")) {
    const parts = text.split(" ");
    const productId = parts[1];
    if (!productId) {
      await sendMessage(chatId, "Gunakan: /order <product_id>");
      res.status(200).send("ok");
      return;
    }
    const customerId = await ensureCustomer(telegramId, username);
    if (!customerId) {
      await sendMessage(chatId, "Gagal membuat profil pelanggan.");
      res.status(200).send("ok");
      return;
    }
    const result = await createOrder(customerId, productId);
    await sendMessage(chatId, result.message);
    res.status(200).send("ok");
    return;
  }

  await sendMessage(chatId, "Perintah tidak dikenali. Coba /katalog.");
  res.status(200).send("ok");
});

app.get("/health", (_req, res) => {
  res.status(200).send("ok");
});

app.listen(port, () => {
  console.log(`Bot webhook running on :${port}`);
});