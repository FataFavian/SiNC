# Direktori Berkas Dokumentasi Wiki SiNC

Direktori ini berisi seluruh halaman dokumentasi resmi proyek **SiNC** yang siap dipublikasikan ke GitHub Wiki repositori (`https://github.com/FataFavian/SiNC/wiki`):

1. **[Home.md](Home.md)**: Halaman depan wiki, pengenalan platform, ringkasan fitur, dan akun demo instan.
2. **[_Sidebar.md](_Sidebar.md)**: Navigasi bilah samping (*sidebar*) yang tampil otomatis di seluruh halaman GitHub Wiki.
3. **[Panduan-Siswa.md](Panduan-Siswa.md)**: Panduan lengkap peran Siswa, kurikulum materi, simulator 3D, inspeksi 360 derajat, asisten AI CNC-Bot, dan alarm tabrakan chuck.
4. **[Panduan-Guru-dan-TeacherBot.md](Panduan-Guru-dan-TeacherBot.md)**: Panduan peran Guru Pengampu, manajemen kelas, pustaka modul 4 level, pengujian simulator mandiri, jobsheet praktikum, dan konsultasi pedagogis bersama CNC-TeacherBot.
5. **[Panduan-Administrator.md](Panduan-Administrator.md)**: Panduan peran Administrator Sekolah, tata kelola akun pengguna, reset kata sandi, pengaturan rombongan belajar, dan pengawasan KBM.
6. **[Arsitektur-Sistem-dan-Teknologi.md](Arsitektur-Sistem-dan-Teknologi.md)**: Spesifikasi arsitektur komputasi serverless, stack teknologi (React, Three.js, Firebase, Gemini AI), algoritma deteksi tabrakan G-Code, dan standar palet warna 60:30:10.

---

### Cara Sinkronisasi ke GitHub Wiki Remote
Setelah halaman pertama diinisialisasi pada peramban web di tab Wiki repositori GitHub (`https://github.com/FataFavian/SiNC/wiki`), seluruh berkas di direktori ini dapat langsung di-*push* ke repositori wiki menggunakan Git:

```bash
git clone https://github.com/FataFavian/SiNC.wiki.git /tmp/wiki
cp wiki/*.md /tmp/wiki/
cd /tmp/wiki
git add .
git commit -m "docs(wiki): sync comprehensive documentation pages from main repository"
git push origin master
```
