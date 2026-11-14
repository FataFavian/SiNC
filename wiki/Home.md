# Selamat Datang di Wiki SiNC (Simulator CNC)

**SiNC (Simulator Kontrol Panel Mesin Bubut CNC & Learning Management System Terpadu)** adalah platform pembelajaran vokasi inovatif berbasis web modern untuk sekolah menengah kejuruan (SMK) Teknik Pemesinan dan institusi pendidikan vokasi di seluruh Indonesia.

Platform ini menggabungkan:
1. **Emulasi Panel Kontrol Fisik 2D**: Meniru tata letak dan tombol kontroler industri GSK 980 / Gremat STH6166.
2. **Simulator Mesin Bubut 3D Interaktif**: Pemodelan permesinan dinamis berbasis WebGL / Three.js lengkap dengan putaran spindel 1200 RPM, semprotan cairan pendingin (*coolant*), percikan serpihan tatal geram (*chips*), dan pembacaan koordinat DRO (*Digital Readout*).
3. **Asisten Cerdas AI (Google Gemini AI)**: Pendampingan dua arah dengan **CNC-Bot** untuk siswa dan **CNC-TeacherBot** untuk guru.
4. **Arsitektur Cloud Serverless**: Berjalan sepenuhnya di sisi peramban web modern dengan integrasi Google Cloud Firestore dan Firebase Auth, tanpa biaya server.

---

## 🌐 Tautan Cepat & Demonstrasi
- **Aplikasi Web Live**: [https://fatafavian.github.io/SiNC/](https://fatafavian.github.io/SiNC/)
- **Streaming Video Demo MP4**: [https://fatafavian.github.io/SiNC/docs/demo-sinc.mp4](https://fatafavian.github.io/SiNC/docs/demo-sinc.mp4)
- **Pemutar Web Interaktif**: [https://fatafavian.github.io/SiNC/docs/](https://fatafavian.github.io/SiNC/docs/)
- **Repositori Kode Sumber**: [https://github.com/FataFavian/SiNC](https://github.com/FataFavian/SiNC)
- **Rilis Resmi v1.0.0**: [https://github.com/FataFavian/SiNC/releases/tag/v1.0.0](https://github.com/FataFavian/SiNC/releases/tag/v1.0.0)

---

## 🔑 Akun Demo Instan (One-Click Login)
Untuk mempermudah pengujian seluruh fitur oleh juri dan praktisi pendidikan, pada halaman login telah disediakan tombol instan untuk 3 peran:

| Peran Pengguna | Email Demo | Kata Sandi | Akses Utama |
|---|---|---|---|
| **Administrator** | `admin@smk.sch.id` | `password123` | Statistik sekolah, manajemen akun, reset password, dan pengaturan rombel |
| **Guru Pengampu** | `guru@smk.sch.id` | `password123` | Manajemen kelas XII TPM 1, pustaka modul 4 level, jobsheet praktikum, dan asisten AI TeacherBot |
| **Siswa 1 (Andi)** | `andi@murid.sch.id` | `password123` | Materi ajar bubut, simulator 3D bebas, inspeksi 360 derajat, AI CNC-Bot, dan alarm tabrakan |

---

## 📑 Struktur Dokumentasi Wiki
Gunakan menu sidebar di sisi kanan untuk menjelajahi bab panduan lengkap:
- [Panduan Siswa & Simulator 3D](Panduan-Siswa)
- [Panduan Guru & AI TeacherBot](Panduan-Guru-dan-TeacherBot)
- [Panduan Administrator](Panduan-Administrator)
- [Arsitektur Sistem & Spesifikasi Teknologi](Arsitektur-Sistem-dan-Teknologi)
