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

export default function App() {
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
          <p>Webhook aktif</p>
          <strong>24/7</strong>
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