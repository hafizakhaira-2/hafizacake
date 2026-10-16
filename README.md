# Hafiza Bakery – Website + Google Sheets Database

Menu kue disimpan di Google Sheets, dikelola lewat panel admin, dan ditampilkan di website.

## Setup Cepat

1. Buat Spreadsheet → sheet bernama **Cakes**
2. Header: `id | name | price | img | desc | category | status | created_at`
3. Paste `Code.gs` ke Apps Script
4. Script Properties:
   - `SPREADSHEET_ID` = ID spreadsheet
   - `ADMIN_PASSWORD` = `Bismillaah`
5. Deploy Web App (Anyone) → copy URL `/exec`
6. Paste URL ke `script.js` (`const API_URL`)
7. Jalankan `seedInitialData()` sekali
8. Upload ke GitHub Pages

## Fitur

| Fitur | Keterangan |
|-------|------------|
| Menu dinamis | Kue diambil dari Google Sheets (status Active) |
| Keranjang + WhatsApp | Pesan langsung via WA |
| Panel Admin | Tombol 🔐 Admin di header |
| CRUD | Tambah / edit / hapus kue |
| Fallback | Kalau API down, pakai data lokal |
| Panduan | `panduan.html` |

## Keamanan

Password & Spreadsheet ID **tidak** disimpan di frontend. Semua dicek di Apps Script via Script Properties.

## Foto

Semua foto memakai hotlink Unsplash (bebas hak cipta untuk penggunaan umum).
