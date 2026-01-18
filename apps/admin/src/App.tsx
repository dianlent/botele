import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";

const kpiData = [
  { label: "Revenue Bulan Ini", value: "Rp 48.2Jt", delta: "+18%" },
  { label: "Order Hari Ini", value: "124", delta: "+12" },
  { label: "Akun Tersedia", value: "312", delta: "-8" },
  { label: "Konfirmasi Pending", value: "9", delta: "+2" }
];

const orderRows = [
  { id: "ORD-2401", product: "Spotify Premium", status: "pending", total: "Rp 59.000" },
  { id: "ORD-2400", product: "Netflix UHD", status: "paid", total: "Rp 89.000" },
  { id: "ORD-2399", product: "Canva Pro", status: "delivered", total: "Rp 35.000" }
];

type AdminProfile = {
  id: string;
  full_name: string | null;
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
    };

    void init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadAdmin = async () => {
      if (!session?.user?.email) {
        setAdmin(null);
        return;
      }

      const { data, error: adminError } = await supabase
        .from("admin_users")
        .select("id,full_name")
        .eq("email", session.user.email)
        .maybeSingle();

      if (adminError || !data) {
        await supabase.auth.signOut();
        setAdmin(null);
        setError("Email tidak terdaftar sebagai admin.");
        return;
      }

      setAdmin(data as AdminProfile);
    };

    void loadAdmin();
  }, [session]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      setError("Login gagal. Periksa email atau password.");
    }

    setStatus("idle");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAdmin(null);
    setSession(null);
  };

  if (!session) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="brand brand--auth">
            <span className="brand__mark">BT</span>
            <div>
              <p className="brand__title">Bot Premium</p>
              <p className="brand__subtitle">Admin Login</p>
            </div>
          </div>
          <p className="auth-desc">
            Masuk menggunakan akun admin yang terdaftar di Supabase.
          </p>
          <form className="auth-form" onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                placeholder="admin@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {error && <p className="auth-error">{error}</p>}
            <button className="btn btn--primary btn--block" disabled={status === "loading"}>
              {status === "loading" ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <p className="auth-desc">Memeriksa akun admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__mark">BT</span>
          <div>
            <p className="brand__title">Bot Premium</p>
            <p className="brand__subtitle">Admin Console</p>
          </div>
        </div>
        <nav className="nav">
          <button className="nav__item nav__item--active">Dashboard</button>
          <button className="nav__item">Produk</button>
          <button className="nav__item">Akun</button>
          <button className="nav__item">Order</button>
          <button className="nav__item">Pembayaran</button>
          <button className="nav__item">Pelanggan</button>
          <button className="nav__item">Laporan</button>
          <button className="nav__item">Pengaturan</button>
        </nav>
        <div className="sidebar__note">
          <p>Login sebagai</p>
          <strong>{admin.full_name || session.user.email}</strong>
          <button className="btn btn--ghost btn--small" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="hero">
          <div>
            <p className="hero__eyebrow">Ringkasan Operasional</p>
            <h1>Kontrol penuh jual beli akun premium.</h1>
            <p className="hero__desc">
              Pantau order, stok akun, dan status pembayaran dalam satu panel.
            </p>
          </div>
          <div className="hero__actions">
            <button className="btn btn--primary">Tambah Produk</button>
            <button className="btn btn--ghost">Tarik Laporan</button>
          </div>
        </header>

        <section className="kpi-grid">
          {kpiData.map((item) => (
            <article key={item.label} className="kpi-card">
              <p>{item.label}</p>
              <div className="kpi-card__row">
                <strong>{item.value}</strong>
                <span>{item.delta}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="split-grid">
          <div className="panel">
            <div className="panel__header">
              <h2>Order Terbaru</h2>
              <button className="btn btn--ghost btn--small">Lihat semua</button>
            </div>
            <div className="table">
              <div className="table__head">
                <span>ID</span>
                <span>Produk</span>
                <span>Status</span>
                <span>Total</span>
              </div>
              {orderRows.map((row) => (
                <div key={row.id} className="table__row">
                  <span>{row.id}</span>
                  <span>{row.product}</span>
                  <span className={`badge badge--${row.status}`}>{row.status}</span>
                  <span>{row.total}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel panel--accent">
            <h2>Checklist Operasional</h2>
            <ul className="checklist">
              <li>
                <span>Verifikasi pembayaran manual</span>
                <strong>5 pending</strong>
              </li>
              <li>
                <span>Top up stok akun premium</span>
                <strong>12 akun</strong>
              </li>
              <li>
                <span>Audit order ditolak</span>
                <strong>2 kasus</strong>
              </li>
            </ul>
            <button className="btn btn--dark">Buka Panel Order</button>
          </div>
        </section>
      </main>
    </div>
  );
}
