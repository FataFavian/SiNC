# Panduan Penggunaan: Guru Pengampu & CNC-TeacherBot

Peran **Guru Pengampu** dirancang untuk memudahkan tenaga pendidik kejuruan (SMK) dalam mengelola kelas, menyusun kurikulum praktik, menguji ketercapaian target sebelum dibagikan ke siswa, serta memanfaatkan asisten cerdas AI untuk merancang jobsheet dan rubrik penilaian.

---

## 1. Alur Masuk & Dasbor Guru

1. **Masuk ke Aplikasi**:
   - Buka halaman login di [https://fatafavian.github.io/SiNC/#/login](https://fatafavian.github.io/SiNC/#/login).
   - Klik tombol instan **Guru** untuk mengisi otomatis akun `guru@smk.sch.id` dan kata sandi `password123`.
   - Klik **Masuk ke SiNC**.
2. **Dasbor Guru**:
   - Menampilkan ringkasan kelas aktif (misalnya Kelas XII TPM 1 Teknik Pemesinan).
   - Menampilkan total submisi tugas siswa yang telah masuk dan memerlukan evaluasi.
   - Grafik distribusi capaian nilai rata-rata siswa dalam kelas.

---

## 2. Pustaka Modul Latihan CNC (Progressive Modules)

Pada menu **Pustaka Modul** (`/#/guru/modul`), guru dapat melihat dan menyusun modul berjenjang yang menjadi acuan target jobsheet:

### 4 Level Modul Kurikulum Bawaan:
1. **Level 1: Gerak Lurus G00/G01**  
   - Mengenal koordinat X sebagai diameter dan Z sepanjang benda kerja.
   - Perbedaan mendasar gerak cepat bebas beban (G00) dan gerak penyayatan berumpan (G01).
   - Target Geometri: Stock Ø40 L60 menjadi Ø30 Z-30 mm.
2. **Level 2: Pembubutan Tirus (Taper Turning)**  
   - Membubut permukaan miring dan chamfer ujung benda kerja.
   - Target Geometri: Stock Ø40 L60 menjadi Ø20 Z-40 mm.
3. **Level 3: Pembubutan Bertingkat (Step Turning)**  
   - Membuat 3 undakan bertingkat (Ø40 → Ø30 → Ø20).
   - Melatih siswa menarik pahat ke diameter aman sebelum berpindah cepat dengan G00.
4. **Level 4: Interpolasi Melingkar Radius G02/G03**  
   - Membuat radius fillet dan cembung menggunakan parameter R atau I/K.

### Pengujian Modul pada Simulator (Test Bed):
- Di panel sebelah kanan, guru dapat memilih modul dan langsung mengujinya pada simulator mini sebelum diterbitkan.
- Hal ini mencegah siswa menerima target geometri yang mustahil dikerjakan atau menimbulkan tabrakan mekanis.

---

## 3. Manajemen Rombel & Penugasan Jobsheet

- **Rombel Saya (`/#/guru/kelas`)**: Guru dapat melihat daftar siswa yang terdaftar dalam rombongan belajar, nomor induk, status verifikasi akun, dan keaktifan latihan.
- **Tugas & Kuis (`/#/guru/tugas`)**:
  - Guru dapat membuat penugasan praktik baru dengan menautkan modul dari pustaka atau membuat target mandiri.
  - Mengunggah berkas petunjuk kerja (LKPD/Jobsheet format PDF).
  - Menentukan batas waktu pengumpulan tugas (*due date*).
- **Penilaian Otomatis & Manual**:
  - Mesin evaluasi otomatis SiNC menganalisis blok kode G-Code siswa, memeriksa tabrakan pahat, membandingkan profil hasil potongan dengan target 3D, dan memberikan skor objektif 0-100.
  - Guru dapat memberikan catatan feedback personal dan mengekspor rekapitulasi nilai ke format lembar sebar (spreadsheet).

---

## 4. Asisten Cerdas Guru: CNC-TeacherBot

Saat guru masuk ke aplikasi, maskot AI di pojok kanan bawah bertransformasi menjadi **CNC-TeacherBot (Partner KBM & Penyusun Tugas)** dengan avatar pendidik berjas rapi.

### Kemampuan Khusus CNC-TeacherBot:
1. **Perancangan Draf Tugas & LKPD**: Membantu menyusun draf instruksi kerja praktikum lengkap dengan skenario pemotongan.
2. **Penyusunan Soal Kuis Otomatis**: Menghasilkan butir soal pilihan ganda atau esai teknis seputar G-Code, K3, dan fungsi tombol kontroler beserta kunci jawaban dan pembahasan.
3. **Kalkulator & Rumus Pemesinan Industri**:
   - Menghitung kecepatan potong ($V_c = \frac{\pi \cdot d \cdot n}{1000}$).
   - Menghitung putaran spindel ($n = \frac{1000 \cdot V_c}{\pi \cdot d}$).
   - Rekomendasi laju pemakanan (*feed rate*) untuk material baja St.37, aluminium, atau kuningan.
4. **Perumusan Rubrik Penilaian**: Menyusun kriteria penilaian berbobot (dimensi presisi 40%, efisiensi langkah G-Code 30%, keselamatan kerja K3 30%).
