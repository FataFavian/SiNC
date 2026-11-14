# Arsitektur Sistem & Spesifikasi Teknologi

**SiNC** dibangun dengan filosofi rekayasa perangkat lunak modern: **Full Serverless, Kinerja Tinggi, dan Nol Biaya Perawatan Server**. Sistem ini dirancang untuk dijalankan langsung pada peramban web modern tanpa memerlukan instalasi software simulator desktop yang berat dan berlisensi mahal.

---

## 1. Arsitektur Komputasi Serverless

Platform ini beroperasi dengan model komputasi terdistribusi di sisi klien (*client-side execution*):

```text
[ Browser Klien (React 18 + Vite) ]
        │
        ├── Three.js WebGL Engine (Simulasi 3D Bubut, Coolant, Geram, DRO)
        ├── CNC Simulation Engine (Parser G-Code & Deteksi Tabrakan)
        │
        ▼
[ Layanan Google Cloud Serverless ]
        ├── Firebase Authentication (Sesi Akun & Peran)
        ├── Cloud Firestore NoSQL (Sinkronisasi Real-time KBM & Modul)
        ├── Firebase Storage (Berkas PDF LKPD/Jobsheet)
        └── Google Gemini AI API (Asisten Cerdas Sokratik)
```

### Keunggulan Arsitektur:
1. **Nol Biaya Server (Zero Infrastructure Cost)**: Memanfaatkan alokasi gratis (*free-tier*) Google Firebase & GitHub Pages sehingga sekolah tidak dibebani biaya sewa VPS bulanan.
2. **Kinerja Rendah Latensi**: Seluruh kalkulasi matriks gerak pahat, interpolasi busur, dan deteksi tumbukan benda kerja dihitung langsung oleh prosesor (CPU/GPU) perangkat pengguna melalui Three.js dan WebGL.
3. **Ketahanan Tinggi (High Availability)**: Tidak ada *single point of failure* pada server aplikasi backend tradisional; aplikasi tetap dapat beroperasi lancar meskipun ribuan siswa membukanya secara bersamaan di ruang lab komputer SMK.

---

## 2. Stack Teknologi

| Komponen Sistem | Teknologi | Peran & Alasan Pemilihan |
|---|---|---|
| **Frontend Framework** | React 18, JavaScript ES6+, HTML5, CSS3 | Komponen antarmuka modular, reaktif, dan standar industri modern |
| **Peralatan Build** | Vite 5 | *Hot Module Replacement* (HMR) secepat kilat dan bundling produksi optimal |
| **Engine Grafis 3D** | Three.js (WebGL) | Rendering 3D perangkat keras tanpa plugin tambahan di browser |
| **Database Cloud** | Google Cloud Firestore | Database dokumen NoSQL terkelola dengan sinkronisasi instan |
| **Manajemen Akses** | Firebase Authentication | Keamanan otentikasi berbasis token dengan persistensi IndexedDB |
| **Penyimpanan Berkas** | Firebase Storage | Pengunggahan dan pengunduhan aman berkas lembar kerja LKPD |
| **Kecerdasan Buatan (AI)** | Google Gemini API (Flash Lite) | Respon inferensi AI cepat dengan *system instruction* pedagogis |
| **Hosting & CI/CD** | GitHub Pages & GitHub Actions | Deployment otomatis (*continuous delivery*) berbasis branch Git |

---

## 3. Mesin Simulasi G-Code & Deteksi Tabrakan

Inti logika permesinan SiNC diatur oleh modul [lms-cnc-client/src/api.js]:
1. **Tokenisasi & Parsing G-Code**:
   - Membaca baris kode G-Code karakter demi karakter.
   - Mengurai perintah gerak utama (`G00`, `G01`, `G02`, `G03`), sistem koordinat (`G90`/`G91`), koordinat target (`X`, `Z`), radius busur (`R`, `I`, `K`), serta parameter pemakanan (`F`).
2. **Kalkulasi Profil Permukaan Benda Kerja**:
   - Algoritma interpolasi profil memperbarui kontur diameter silinder logam secara *continuous line segment* saat pahat menyayat material.
3. **Deteksi Tabrakan Mekanis (Collision Detection)**:
   - Sistem memvalidasi koordinat pahat terhadap geometri fisik kepala tetap (*headstock*) dan cekam putar (*three-jaw chuck*).
   - Gerakan pemotongan berkecepatan tinggi yang masuk ke area terlarang akan memicu status darurat (*Emergency Stop*).

---

## 4. Standar Estetika Antarmuka (Liquid Glass 60:30:10)

Antarmuka pengguna mengadopsi estetika *modern liquid glass* dengan perimbangan palet warna ergonomis:
- **60% Navy Deep (`#0b1120`, `#0f172a`)**: Dominasi latar kerja simulator untuk kenyamanan mata dan kontras tinggi saat memantau permesinan berjam-jam.
- **30% Cream Slate (`#f8fafc`, `#e2e8f0`)**: Kontainer kartu, tipografi teks informasi, dan panel kendali sekunder.
- **10% Coral Accent (`#f97316`, `#ef4444`)**: Tombol aksi utama, sakelar spindel aktif, indikator coolant, dan sinyal alarm tabrakan.
