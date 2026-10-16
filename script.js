/**
 * HAFIZA BAKERY – Frontend + Google Sheets via Apps Script
 *
 * SETUP:
 * 1. Deploy Code.gs sebagai Web App
 * 2. Paste URL /exec di bawah
 */

const API_URL = "https://script.google.com/macros/s/AKfycby4JclmewJCt4Tca322WfO8tSgENzk8lOZt9F7931-rIH47O-h5r5n__hZEWGJNauTO/exec";

/* Fallback data (kalau API belum siap) */
const FALLBACK_CAKES = [
  {id:1,name:"Chocolate Dream",price:85000,img:"https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=85",desc:"Kue cokelat lembut dengan krim manis."},
  {id:2,name:"Strawberry Cake",price:90000,img:"https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=85",desc:"Vanila lembut, stroberi segar, creamy."},
  {id:3,name:"Red Velvet",price:95000,img:"https://images.unsplash.com/photo-1586788224331-947f68671cf1?auto=format&fit=crop&w=800&q=85",desc:"Red velvet klasik dengan cream cheese."},
  {id:4,name:"Berry Cheesecake",price:88000,img:"https://images.unsplash.com/photo-1533134486753-c833f0ed4866?auto=format&fit=crop&w=800&q=85",desc:"Cheesecake creamy dengan buah berry."},
  {id:5,name:"Croissant Sweet",price:55000,img:"https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=85",desc:"Pastry renyah, buttery, dan harum."},
  {id:6,name:"Vanilla Cupcake",price:35000,img:"https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=800&q=85",desc:"Cupcake vanila lembut dengan frosting manis."},
  {id:7,name:"Lemon Tart",price:65000,img:"https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=800&q=85",desc:"Tart lemon segar dengan kulit renyah."}
];

let cakes = [...FALLBACK_CAKES];
let cart = JSON.parse(localStorage.getItem("hafizaCart") || "[]");
let lang = "id";
let adminPassword = sessionStorage.getItem("hafiza_admin_pw") || "";
let allCakesAdmin = [];

const text = {
 id:{
  navHome:"Beranda",navCakes:"Kue",navAbout:"Tentang",eyebrow:"Dibuat dengan cinta • Dipanggang setiap hari",
  heroTitle:"Manisnya bikin<br><em>jatuh hati.</em>",heroText:"Kue lembut, rasa hangat, dan momen kecil yang terasa lebih spesial. Temukan favoritmu di Hafiza Bakery.",
  heroButton:"Lihat Menu",menuEyebrow:"Menu pilihan",menuTitle:"Kue untuk setiap <em>momen.</em>",menuDesc:"Pilih kue favoritmu, masukkan ke keranjang, lalu pesan langsung melalui WhatsApp.",
  aboutEyebrow:"Tentang Hafiza Bakery",aboutTitle:"Sedikit manis,<br><em>banyak cerita.</em>",aboutText:"Hafiza Bakery hadir untuk menemani hari-harimu dengan kue yang fresh, lembut, dan dibuat sepenuh hati. Cocok untuk hadiah, kumpul keluarga, atau sekadar memanjakan diri.",
  cartEyebrow:"Pesananmu",cartTitle:"Keranjang <em>kue.</em>",total:"Total",checkoutNote:"Pesanan akan dibuka di WhatsApp dengan format otomatis.",empty:"Kue yang kamu cari belum ditemukan."
 },
 en:{
  navHome:"Home",navCakes:"Cakes",navAbout:"About",eyebrow:"Made with love • Baked every day",
  heroTitle:"Sweet enough to<br><em>fall in love.</em>",heroText:"Soft cakes, warm flavors, and little moments made extra special. Find your favorite at Hafiza Bakery.",
  heroButton:"View Menu",menuEyebrow:"Our picks",menuTitle:"Cakes for every <em>moment.</em>",menuDesc:"Pick your favorite cake, add it to the cart, then order directly through WhatsApp.",
  aboutEyebrow:"About Hafiza Bakery",aboutTitle:"A little sweet,<br><em>a lot of stories.</em>",aboutText:"Hafiza Bakery is here to brighten your days with fresh, soft cakes made with heart. Perfect for gifts, family gatherings, or simply treating yourself.",
  cartEyebrow:"Your order",cartTitle:"Cake <em>cart.</em>",total:"Total",checkoutNote:"Your order will open in WhatsApp with an automatic message.",empty:"No cakes match your search."
 }
};

function rupiah(n){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n)}

function isApiReady() {
  return API_URL && !API_URL.includes("PASTE_") && API_URL.includes("/exec");
}

async function apiGet(params = {}, timeoutMs = 8000) {
  if (!isApiReady()) throw new Error("API belum di-set");
  const url = new URL(API_URL);
  Object.entries(params).forEach(([k, v]) => { if (v != null && v !== "") url.searchParams.set(k, v); });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url.toString(), { method: "GET", signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error("Network error");
    return res.json();
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

async function apiPost(payload, timeoutMs = 10000) {
  if (!isApiReady()) throw new Error("API belum di-set");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error("Network error");
    return res.json();
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

function renderCakes(list = cakes) {
  const grid = document.getElementById("cakeGrid");
  if (!grid) return;
  grid.innerHTML = list.map(c => `<article class="cake-card">
    <img class="cake-img" src="${c.img}" alt="${c.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=85'">
    <div class="cake-info"><h3>${c.name}</h3><p>${c.desc}</p>
    <div class="price-row"><span class="price">${rupiah(c.price)}</span><button class="add-btn" onclick="addToCart(${c.id})" aria-label="Tambah ${c.name}">+</button></div></div>
  </article>`).join("");
  const empty = document.getElementById("emptyState");
  if (empty) empty.hidden = list.length !== 0;
}

function addToCart(id) {
  const item = cart.find(x => x.id === id);
  item ? item.qty++ : cart.push({ id, qty: 1 });
  save(); openCart();
}

function changeQty(id, delta) {
  const item = cart.find(x => x.id === id); if (!item) return;
  item.qty += delta; if (item.qty <= 0) cart = cart.filter(x => x.id !== id); save(); renderCart();
}

function save() { localStorage.setItem("hafizaCart", JSON.stringify(cart)); renderCart(); }

function renderCart() {
  const countEl = document.getElementById("cartCount");
  if (countEl) countEl.textContent = cart.reduce((a, x) => a + x.qty, 0);
  const box = document.getElementById("cartItems");
  if (!box) return;
  box.innerHTML = cart.length ? cart.map(x => {
    const c = cakes.find(k => k.id === x.id);
    if (!c) return "";
    return `<div class="cart-item">
      <img src="${c.img}" alt="${c.name}"><div><h4>${c.name}</h4><small>${rupiah(c.price)}</small>
      <div class="qty"><button onclick="changeQty(${c.id},-1)">−</button><span>${x.qty}</span><button onclick="changeQty(${c.id},1)">+</button></div></div>
      <strong>${rupiah(c.price * x.qty)}</strong></div>`;
  }).join("") : `<p style="color:#786b64;font-size:14px">Keranjang masih kosong. Yuk pilih kue favoritmu ♡</p>`;
  const total = cart.reduce((a, x) => {
    const c = cakes.find(k => k.id === x.id);
    return a + (c ? c.price * x.qty : 0);
  }, 0);
  const totalEl = document.getElementById("cartTotal");
  if (totalEl) totalEl.textContent = rupiah(total);
}

function openCart() {
  const p = document.getElementById("cartPanel");
  if (p) { p.classList.add("open"); p.setAttribute("aria-hidden", "false"); }
}
function closeCart() {
  const p = document.getElementById("cartPanel");
  if (p) { p.classList.remove("open"); p.setAttribute("aria-hidden", "true"); }
}

function setLanguage() {
  lang = document.getElementById("language").value;
  document.querySelectorAll("[data-id]").forEach(el => {
    const key = el.dataset.id;
    if (text[lang][key]) el.innerHTML = text[lang][key];
  });
  document.documentElement.lang = lang;
  const search = document.getElementById("searchInput");
  if (search) search.placeholder = lang === "id" ? "Cari kue..." : "Search cakes...";
}

/* ---------- Events ---------- */
document.getElementById("searchInput")?.addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  renderCakes(cakes.filter(c => (c.name + " " + c.desc).toLowerCase().includes(q)));
});
document.getElementById("language")?.addEventListener("change", setLanguage);
document.getElementById("cartButton")?.addEventListener("click", openCart);
document.getElementById("closeCart")?.addEventListener("click", closeCart);
document.getElementById("cartOverlay")?.addEventListener("click", closeCart);
document.getElementById("checkout")?.addEventListener("click", () => {
  if (!cart.length) { alert(lang === "id" ? "Keranjang masih kosong." : "Your cart is empty."); return; }
  const lines = cart.map(x => { const c = cakes.find(k => k.id === x.id); return `• ${c.name} x${x.qty} — ${rupiah(c.price * x.qty)}`; });
  const total = cart.reduce((a, x) => a + cakes.find(c => c.id === x.id).price * x.qty, 0);
  const msg = `Halo Kak Hafiza Bakery! Saya mau pesan kue:%0A%0A${encodeURIComponent(lines.join("\n"))}%0A%0ATotal: ${encodeURIComponent(rupiah(total))}%0A%0AMohon info ketersediaan dan proses pesanannya ya. Terima kasih!`;
  window.open(`https://wa.me/6282148465860?text=${msg}`, "_blank");
});

/* ============================================================
 *  ADMIN
 * ============================================================ */
const adminPanel = document.getElementById("adminPanel");
const adminLoginView = document.getElementById("adminLoginView");
const adminDashView = document.getElementById("adminDashView");

function openAdmin() {
  if (!adminPanel) return;
  adminPanel.hidden = false;
  if (adminPassword) showDash(); else showLogin();
}
function closeAdmin() { if (adminPanel) adminPanel.hidden = true; }
function showLogin() {
  if (adminLoginView) adminLoginView.hidden = false;
  if (adminDashView) adminDashView.hidden = true;
}
function showDash() {
  if (adminLoginView) adminLoginView.hidden = true;
  if (adminDashView) adminDashView.hidden = false;
  loadAdminCakes();
}

document.getElementById("adminBtn")?.addEventListener("click", openAdmin);
document.getElementById("adminCloseLogin")?.addEventListener("click", closeAdmin);
document.querySelector(".admin-overlay")?.addEventListener("click", closeAdmin);

document.getElementById("adminLoginBtn")?.addEventListener("click", async () => {
  const pw = (document.getElementById("adminPassword")?.value || "").trim();
  const status = document.getElementById("adminLoginStatus");
  if (!pw) { if (status) { status.textContent = "Password kosong"; status.className = "form-status error"; } return; }
  try {
    const data = await apiPost({ action: "admin_login", password: pw });
    if (data.success) {
      adminPassword = pw;
      sessionStorage.setItem("hafiza_admin_pw", pw);
      showDash();
    } else throw new Error(data.message);
  } catch (e) {
    if (status) { status.textContent = "❌ " + (e.message || "Gagal"); status.className = "form-status error"; }
  }
});

document.getElementById("adminLogout")?.addEventListener("click", () => {
  adminPassword = "";
  sessionStorage.removeItem("hafiza_admin_pw");
  showLogin();
});

document.querySelectorAll(".admin-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".admin-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    document.querySelectorAll(".admin-tab-content").forEach(c => c.hidden = true);
    const target = document.getElementById("tab-" + tab.dataset.tab);
    if (target) target.hidden = false;
  });
});

async function loadAdminCakes() {
  try {
    const data = await apiGet({ action: "admin_cakes", password: adminPassword });
    if (data.success) {
      allCakesAdmin = data.items || [];
      renderAdminTable();
    }
  } catch (e) { console.error(e); }
}

function renderAdminTable() {
  const tbody = document.querySelector("#cakesTable tbody");
  if (!tbody) return;
  const q = (document.getElementById("filterCakes")?.value || "").toLowerCase();
  const filtered = allCakesAdmin.filter(item => !q || (item.name + item.desc).toLowerCase().includes(q));
  tbody.innerHTML = filtered.map(item => `
    <tr>
      <td>${item.id}</td>
      <td><img src="${item.img || ''}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:8px" onerror="this.style.display='none'"></td>
      <td>${esc(item.name)}</td>
      <td>${rupiah(item.price)}</td>
      <td><span class="badge-status">${esc(item.status)}</span></td>
      <td>
        <button class="icon-btn" onclick="editCake(${item.row})">✏️</button>
        <button class="icon-btn" onclick="deleteCake(${item.row})">🗑️</button>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="6" style="text-align:center;opacity:.6">Belum ada data</td></tr>`;
}

function esc(s) { const d = document.createElement("div"); d.textContent = s ?? ""; return d.innerHTML; }

document.getElementById("filterCakes")?.addEventListener("input", renderAdminTable);
document.getElementById("refreshCakes")?.addEventListener("click", loadAdminCakes);

window.editCake = function(row) {
  const item = allCakesAdmin.find(t => t.row === row);
  if (!item) return;
  document.getElementById("editRow").value = row;
  document.getElementById("editName").value = item.name;
  document.getElementById("editPrice").value = item.price;
  document.getElementById("editImg").value = item.img;
  document.getElementById("editDesc").value = item.desc;
  document.getElementById("editStatus").value = item.status;
  document.getElementById("editStatusMsg").textContent = "";
  document.getElementById("editModal").hidden = false;
};

window.deleteCake = async function(row) {
  if (!confirm("Hapus kue ini?")) return;
  try {
    const data = await apiPost({ action: "delete_cake", password: adminPassword, row });
    if (data.success) { await loadAdminCakes(); await loadPublicCakes(); }
    else alert(data.message);
  } catch (e) { alert(e.message); }
};

document.getElementById("cancelEditBtn")?.addEventListener("click", () => {
  document.getElementById("editModal").hidden = true;
});

document.getElementById("saveEditBtn")?.addEventListener("click", async () => {
  const row = Number(document.getElementById("editRow").value);
  const payload = {
    action: "update_cake",
    password: adminPassword,
    row,
    name: document.getElementById("editName").value,
    price: Number(document.getElementById("editPrice").value),
    img: document.getElementById("editImg").value,
    desc: document.getElementById("editDesc").value,
    status: document.getElementById("editStatus").value
  };
  const msg = document.getElementById("editStatusMsg");
  try {
    const data = await apiPost(payload);
    if (data.success) {
      msg.textContent = "✅ Tersimpan";
      msg.className = "form-status success";
      document.getElementById("editModal").hidden = true;
      await loadAdminCakes();
      await loadPublicCakes();
    } else {
      msg.textContent = data.message;
      msg.className = "form-status error";
    }
  } catch (e) {
    msg.textContent = e.message;
    msg.className = "form-status error";
  }
});

document.getElementById("addCakeForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("addStatusMsg");
  const payload = {
    action: "create_cake",
    password: adminPassword,
    name: document.getElementById("addName").value.trim(),
    price: Number(document.getElementById("addPrice").value),
    img: document.getElementById("addImg").value.trim(),
    desc: document.getElementById("addDesc").value.trim(),
    category: document.getElementById("addCategory").value,
    status: document.getElementById("addStatus").value
  };
  try {
    const data = await apiPost(payload);
    if (data.success) {
      msg.textContent = "✅ Kue ditambahkan";
      msg.className = "form-status success";
      e.target.reset();
      await loadAdminCakes();
      await loadPublicCakes();
    } else {
      msg.textContent = data.message;
      msg.className = "form-status error";
    }
  } catch (err) {
    msg.textContent = err.message;
    msg.className = "form-status error";
  }
});

async function loadPublicCakes() {
  try {
    const data = await apiGet({ action: "getcakes" });
    if (data.success && data.cakes && data.cakes.length) {
      cakes = data.cakes;
      renderCakes();
      renderCart();
    }
  } catch (e) {
    console.warn("Pakai fallback:", e.message);
  }
}

/* ---------- Init ---------- */
renderCakes();
renderCart();
loadPublicCakes();
