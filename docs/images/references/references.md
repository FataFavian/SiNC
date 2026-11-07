# Atribusi & Referensi Desain

Dokumen ini mencatat sumber dan referensi visual yang digunakan dalam proses perancangan dan pemodelan simulator SiNC.

---

## 1. Referensi Panel Kontrol CNC 2D

- **Berkas**: `referensi control panel cnc.jpeg`
- **Objek Acuan**: Panel kontrol kontroler CNC (tombol mode operasi: EDIT, AUTO, JOG, MDI; pengatur feedrate override; tombol cycle start/stop; dan koordinat sumbu X/Z).
- **Penggunaan dalam Proyek**: Menjadi dasar acuan desain antarmuka 2D pada komponen `ControlPanel2D.jsx` dan pemodelan panel kontrol mesin.
- **Tujuan**: Membiasakan siswa dengan tata letak tombol standar mesin industri.

---

## 2. Referensi Mesin Bubut CNC 3D

- **Berkas**: `referensi mesin cnc gremat sth6166.webp`
- **Objek Acuan**: Mesin Bubut CNC **Gremat STH6166** (2-Axis Flat/Slant Bed Lathe).
- **Komponen Mesin yang Dimodelkan**:
  - **Headstock & Spindle Chuck**: Pencekam silinder benda kerja dan putaran spindle.
  - **Bed & Guide Rails**: Rel pemandu longitudinal (Sumbu Z).
  - **Carriage & Cross Slide**: Eretan lintang pahat (Sumbu X).
  - **Tool Turret / Holder**: Rumah pahat bubut dan geometri pisau potong.
  - **Tailstock (Kepala Lepas)**: Penyangga benda kerja panjang.
  - **Enclosure & Glass Window**: Kabin pelindung keselamatan dan kaca transparan.
  - **Coolant Nozzle & Chip Tray**: Semprotan pendingin cairan dan penampung gram bubut.

---

> **Catatan Atribusi**: Seluruh gambar referensi digunakan murni untuk keperluan studi desain dan perancangan media pembelajaran edukasi (non-komersial) pada kompetisi LOGICODIX 2026.
