# Panduan Penggunaan: Siswa & Simulator 3D

Peran **Siswa** dirancang untuk memberikan pengalaman belajar mandiri dan terbimbing yang menyenangkan (*Smart & Fun Education*). Melalui SiNC, siswa SMK dapat menguasai pemrograman G-Code mesin bubut CNC tanpa rasa takut merusak mesin industri berharga ratusan juta rupiah.

---

## 1. Alur Masuk & Dasbor Belajar

1. **Masuk ke Aplikasi**:
   - Buka halaman login di [https://fatafavian.github.io/SiNC/#/login](https://fatafavian.github.io/SiNC/#/login).
   - Klik tombol instan **Siswa** untuk mengisi otomatis akun `andi@murid.sch.id` dan kata sandi `password123`.
   - Klik **Masuk ke SiNC**.
2. **Dasbor Siswa**:
   - Menampilkan total jam latihan permesinan, tingkat penguasaan modul, dan rata-rata skor tugas praktikum.
   - Menyajikan daftar tugas yang perlu segera dikerjakan dan progres materi terkini.

---

## 2. Eksplorasi Materi Ajar Kurikulum CNC

Pada menu **Materi Ajar** (`/#/siswa/materi`), siswa dapat mempelajari modul terstruktur:
- **Pengenalan Mesin Bubut CNC**: Bagian utama mesin (headstock, carriage, turret, tailstock, chuck, bed peluncur).
- **Sistem Koordinat Kartesius 2 Sumbu**: Sumbu X (diameter benda kerja) dan Sumbu Z (panjang aksial terhadap datum muka benda kerja).
- **Format Blok G-Code**: Perintah gerak cepat (G00), interpolasi lurus penyayatan (G01), interpolasi melingkar (G02/G03), sistem absolut (G90) vs inkremental (G91), serta kecepatan pemakanan (F/Feed rate).
- **K3 dan Keselamatan Kerja Bengkel**: Standar APD, penanganan tatal geram, dan mitigasi tabrakan pahat.

---

## 3. Simulator Mesin Bubut CNC 3D Interaktif

Pada menu **Simulator Bebas** (`/#/siswa/latihan`), siswa memiliki kebebasan bereksperimen:

### Fitur Permesinan 3D:
- **Putaran Spindel Dinamis**: Spindel dan cekam (*chuck*) berputar realistis pada kecepatan 1200 RPM.
- **Sistem Pendingin (Coolant Flow)**: Aliran cairan pendingin aktif dari nosel fleksibel untuk mendinginkan area kontak pahat dan benda kerja.
- **Percikan Tatal Geram (Chip Formation)**: Simulasi partikel tatal logam yang terlempar saat mata pahat menyayat permukaan benda kerja.
- **Panel Koordinat DRO Digital**: Pembacaan posisi presisi X dan Z dalam resolusi 0.001 mm secara langsung saat program berjalan.
- **Mode Layar Penuh (Theater Mode)**: Memberikan pengalaman kerja mendalam seolah berada tepat di depan mesin bubut nyata.

### Inspeksi Benda Kerja Pameran 360 Derajat:
- Tombol **Pameran 360°** memutar benda kerja pada meja putar virtual (*turntable*).
- Menampilkan tekstur kilau metalik realistis hasil penyayatan bertingkat beserta garis ukur diameter (Ø) dan panjang (Z) untuk verifikasi dimensi toleransi.

---

## 4. Pendampingan Asisten AI Sokratik (CNC-Bot)

Di pojok kanan bawah layar tersedia maskot interaktif **CNC-Bot**.

### Karakteristik CNC-Bot:
- **Metode Pembelajaran Sokratik**: CNC-Bot tidak memberikan jawaban instan yang memanjakan siswa, melainkan memberikan pertanyaan pemantik dan penjelasan konsep agar siswa berpikir kritis.
- **Animasi Unik per Halaman**: Maskot bergerak melompat gembira, berfikir santai, atau mengedipkan mata sesuai konteks halaman.
- **Tombol Cepat (Quick Chips)**: Siswa dapat menanyakan konsep dasar hanya dengan satu klik:
  - *"Apa beda G00 dan G01?"*
  - *"Kenapa pahat tabrakan saat mundur?"*
  - *"Bagaimana menentukan koordinat X diameter?"*

---

## 5. Simulasi Keselamatan: Emergency Crash Alarm

Salah satu keunggulan utama SiNC adalah edukasi pencegahan kecelakaan kerja industri.
- Jika siswa memasukkan koordinat yang salah (misalnya melakukan gerak potong berkecepatan tinggi G00 menabrak cekam *chuck*), sistem deteksi tabrakan fisik akan langsung membunyikan **Emergency Crash Alarm**.
- Lampu peringatan bahaya berkedip merah terang dan gerakan mesin dihentikan seketika untuk melindungi operator.
- Siswa dapat melihat letak kesalahan kode dan memperbaikinya secara aman tanpa risiko fisik apa pun.
