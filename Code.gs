/**
 * ============================================================
 *  HAFIZA BAKERY – Google Apps Script Backend
 * ============================================================
 *
 *  SETUP (sekali saja):
 *  1. Buat Spreadsheet baru → nama "Hafiza Bakery Database"
 *  2. Buat sheet bernama: Cakes
 *  3. Header baris 1:
 *     id | name | price | img | desc | category | status | created_at
 *  4. Extensions → Apps Script → paste seluruh file ini
 *  5. Project Settings → Script Properties → Add:
 *       SPREADSHEET_ID  = <ID spreadsheet>
 *       ADMIN_PASSWORD  = Bismillaah
 *  6. Deploy → New deployment → Web app
 *       Execute as: Me | Who has access: Anyone
 *  7. Copy URL /exec → paste ke script.js (const API_URL)
 *
 *  JANGAN simpan password / spreadsheet ID di frontend!
 */

const SHEET_CAKES = "Cakes";

function getProp(key) {
  const v = PropertiesService.getScriptProperties().getProperty(key);
  if (!v) throw new Error("Script Property '" + key + "' belum di-set.");
  return v;
}

function getSpreadsheetId() {
  return getProp("SPREADSHEET_ID");
}

function getAdminPassword() {
  return getProp("ADMIN_PASSWORD");
}

function requireAdmin(password) {
  if (!password || String(password) !== getAdminPassword()) {
    throw new Error("Unauthorized: password admin salah");
  }
}

/* ---------- Entry points ---------- */
function doGet(e) {
  const action = (e.parameter.action || "").toLowerCase();
  const password = e.parameter.password || "";

  try {
    switch (action) {
      case "getcakes":
        return jsonResponse(getCakes());
      case "admin_cakes":
        requireAdmin(password);
        return jsonResponse(adminGetAllCakes());
      default:
        return jsonResponse({ success: false, message: "Unknown action" });
    }
  } catch (err) {
    return jsonResponse({ success: false, message: err.message });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = (body.action || "").toLowerCase();
    const password = body.password || "";

    if (action === "admin_login") {
      requireAdmin(password);
      return jsonResponse({ success: true, message: "Login berhasil" });
    }

    requireAdmin(password);

    switch (action) {
      case "create_cake":
        return jsonResponse(createCake(body));
      case "update_cake":
        return jsonResponse(updateCake(body));
      case "delete_cake":
        return jsonResponse(deleteCake(body));
      default:
        return jsonResponse({ success: false, message: "Unknown action" });
    }
  } catch (err) {
    return jsonResponse({ success: false, message: err.message });
  }
}

/* ---------- Public ---------- */
function getCakes() {
  const sheet = getSheet(SHEET_CAKES);
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, cakes: [] };

  const headers = rows[0].map(h => String(h).toLowerCase().trim());
  const idx = {
    id: headers.indexOf("id"),
    name: headers.indexOf("name"),
    price: headers.indexOf("price"),
    img: headers.indexOf("img"),
    desc: headers.indexOf("desc"),
    category: headers.indexOf("category"),
    status: headers.indexOf("status")
  };

  const cakes = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const status = String(row[idx.status] || "").trim().toLowerCase();
    if (status !== "active" && status !== "approved") continue;

    const name = String(row[idx.name] || "").trim();
    if (!name) continue;

    cakes.push({
      id: row[idx.id],
      name: name,
      price: Number(row[idx.price] || 0),
      img: String(row[idx.img] || ""),
      desc: String(row[idx.desc] || ""),
      category: String(row[idx.category] || "cake")
    });
  }

  return { success: true, cakes };
}

/* ---------- Admin ---------- */
function adminGetAllCakes() {
  const sheet = getSheet(SHEET_CAKES);
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, items: [] };

  const headers = rows[0].map(h => String(h).toLowerCase().trim());
  const idx = {
    id: headers.indexOf("id"),
    name: headers.indexOf("name"),
    price: headers.indexOf("price"),
    img: headers.indexOf("img"),
    desc: headers.indexOf("desc"),
    category: headers.indexOf("category"),
    status: headers.indexOf("status"),
    created_at: headers.indexOf("created_at")
  };

  const items = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    items.push({
      row: i + 1,
      id: row[idx.id],
      name: String(row[idx.name] || ""),
      price: Number(row[idx.price] || 0),
      img: String(row[idx.img] || ""),
      desc: String(row[idx.desc] || ""),
      category: String(row[idx.category] || ""),
      status: String(row[idx.status] || ""),
      created_at: String(row[idx.created_at] || "")
    });
  }
  return { success: true, items };
}

function createCake(body) {
  const name = String(body.name || "").trim();
  const price = Number(body.price || 0);
  const img = String(body.img || "").trim();
  const desc = String(body.desc || "").trim();
  const category = String(body.category || "cake").trim();
  const status = String(body.status || "Active").trim();

  if (!name) return { success: false, message: "Nama kue wajib diisi" };
  if (price <= 0) return { success: false, message: "Harga tidak valid" };

  const sheet = getSheet(SHEET_CAKES);
  const nextId = getNextId(sheet);

  sheet.appendRow([
    nextId,
    name,
    price,
    img,
    desc,
    category,
    status,
    new Date().toISOString()
  ]);

  return { success: true, message: "Kue ditambahkan", id: nextId };
}

function updateCake(body) {
  const rowNum = Number(body.row);
  if (!rowNum || rowNum < 2) return { success: false, message: "Row tidak valid" };

  const sheet = getSheet(SHEET_CAKES);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(h => String(h).toLowerCase().trim());

  const updates = {};
  if (body.name != null) updates.name = String(body.name).trim();
  if (body.price != null) updates.price = Number(body.price) || 0;
  if (body.img != null) updates.img = String(body.img).trim();
  if (body.desc != null) updates.desc = String(body.desc).trim();
  if (body.category != null) updates.category = String(body.category).trim();
  if (body.status != null) updates.status = String(body.status).trim();

  for (const [key, val] of Object.entries(updates)) {
    const col = headers.indexOf(key) + 1;
    if (col > 0) sheet.getRange(rowNum, col).setValue(val);
  }

  return { success: true, message: "Kue diupdate" };
}

function deleteCake(body) {
  const rowNum = Number(body.row);
  if (!rowNum || rowNum < 2) return { success: false, message: "Row tidak valid" };

  const sheet = getSheet(SHEET_CAKES);
  sheet.deleteRow(rowNum);
  return { success: true, message: "Kue dihapus" };
}

/* ---------- Helpers ---------- */
function getSheet(name) {
  const id = getSpreadsheetId();
  // Spreadsheet ID biasanya panjang ~44 karakter dan tidak diawali AKfycb
  if (id.startsWith("AKfycb") || id.length < 20) {
    throw new Error("SPREADSHEET_ID salah! Kamu masukkan ID deployment Apps Script. Yang benar adalah ID dari URL spreadsheet (docs.google.com/spreadsheets/d/INI_ID_NYA/edit).");
  }
  const ss = SpreadsheetApp.openById(id);
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error("Sheet '" + name + "' tidak ditemukan. Pastikan nama persis: Cakes");
  return sheet;
}

function getNextId(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 1;
  const numRows = lastRow - 1;
  const ids = sheet.getRange(2, 1, numRows, 1).getValues().flat();
  let max = 0;
  for (const v of ids) {
    const n = Number(v);
    if (!isNaN(n) && n > max) max = n;
  }
  return max + 1;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Jalankan sekali untuk isi data awal + header.
 */
function seedInitialData() {
  const sheet = getSheet(SHEET_CAKES);
  sheet.clear();
  sheet.appendRow(["id", "name", "price", "img", "desc", "category", "status", "created_at"]);

  const data = [
    [1, "Chocolate Dream", 85000, "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=85", "Kue cokelat lembut dengan krim manis.", "cake", "Active", new Date().toISOString()],
    [2, "Strawberry Cake", 90000, "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=85", "Vanila lembut, stroberi segar, creamy.", "cake", "Active", new Date().toISOString()],
    [3, "Red Velvet", 95000, "https://images.unsplash.com/photo-1586788224331-947f68671cf1?auto=format&fit=crop&w=800&q=85", "Red velvet klasik dengan cream cheese.", "cake", "Active", new Date().toISOString()],
    [4, "Berry Cheesecake", 88000, "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?auto=format&fit=crop&w=800&q=85", "Cheesecake creamy dengan buah berry.", "cake", "Active", new Date().toISOString()],
    [5, "Croissant Sweet", 55000, "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=85", "Pastry renyah, buttery, dan harum.", "pastry", "Active", new Date().toISOString()],
    [6, "Vanilla Cupcake", 35000, "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=800&q=85", "Cupcake vanila lembut dengan frosting manis.", "cupcake", "Active", new Date().toISOString()],
    [7, "Lemon Tart", 65000, "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=800&q=85", "Tart lemon segar dengan kulit renyah.", "tart", "Active", new Date().toISOString()]
  ];

  sheet.getRange(2, 1, data.length, 8).setValues(data);
  Logger.log("✅ Seed selesai! " + data.length + " kue ditambahkan.");
}
