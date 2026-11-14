// =============================================================
// mockApi.js - server mock dev otomatis untuk Vite.
// Memungkinkan login demo (admin, guru, siswa) dan pengujian fitur
// secara lokal langsung di browser tanpa perlu server PHP/MySQL.
// =============================================================

export function mockApiPlugin() {
  const users = {
    'admin@smk.sch.id': {
      id: '00000000-0000-0000-0000-000000000001',
      username: 'admin',
      nama: 'Administrator SMK',
      email: 'admin@smk.sch.id',
      role: 'admin',
      status: 'aktif'
    },
    'guru@smk.sch.id': {
      id: '11111111-1111-1111-1111-111111111111',
      username: 'guru',
      nama: 'Pak Guru',
      email: 'guru@smk.sch.id',
      role: 'guru',
      status: 'aktif'
    },
    'andi@murid.sch.id': {
      id: '22222222-2222-2222-2222-222222222222',
      username: 'andi',
      nis: '1001',
      nama: 'Andi Siswa',
      email: 'andi@murid.sch.id',
      role: 'siswa',
      kelas: 'XII TPM 1',
      kelas_id: 'c0000000-0000-0000-0000-000000000001',
      kelas_nama: 'XII TPM 1',
      status: 'aktif'
    }
  };

  const modules = [
    {
      id: 'a0000000-0000-0000-0000-000000000001',
      judul: 'Level 1: Gerak Lurus G00/G01',
      level: 1,
      deskripsi: 'Mengenal koordinat X sebagai diameter dan Z sepanjang benda kerja, serta beda gerak cepat G00 dengan penyayatan G01.',
      target: { stock_d: 40, stock_l: 60, target_d: 30, target_z: 30 },
      starter_gcode: 'G90\nG00 X40 Z0\nG01 X30 Z-30 F100\nG00 X50 Z5',
      lkpd_url: null
    },
    {
      id: 'a0000000-0000-0000-0000-000000000002',
      judul: 'Level 2: Pembubutan Tirus',
      level: 2,
      deskripsi: 'Meniruskan stock Ø40 L60 menjadi Ø20 sepanjang 40 mm.',
      target: { stock_d: 40, stock_l: 60, target_d: 20, target_z: 40 },
      starter_gcode: 'G90\nG00 X40 Z0\nG01 X20 Z-40 F100\nG00 X50\nG00 Z5\nM30',
      lkpd_url: null
    },
    {
      id: 'a0000000-0000-0000-0000-000000000003',
      judul: 'Level 3: Bertingkat (Step Turning)',
      level: 3,
      deskripsi: 'Membuat 3 undakan: Ø40 → Ø30 → Ø20. Tarik pahat ke diameter aman sebelum memakai G00.',
      target: { stock_d: 50, stock_l: 60, target_d: 20, target_z: 55 },
      starter_gcode: 'G90\nG00 X50 Z0\nG01 X40 Z0 F100\nG01 X40 Z-15 F100\nG00 X50\nG00 Z5\nM30',
      lkpd_url: null
    },
    {
      id: 'a0000000-0000-0000-0000-000000000004',
      judul: 'Level 4: Radius G02/G03',
      level: 4,
      deskripsi: 'Membuat fillet radius 5 mm. Busur memakai I/K.',
      target: { stock_d: 40, stock_l: 60, target_d: 30, target_z: 20 },
      starter_gcode: 'G90\nG00 X40 Z0\nG01 X30 Z-15 F100\nG03 X20 Z-20 R5 F80\nG00 X50\nG00 Z5\nM30',
      lkpd_url: null
    }
  ];

  const kelasList = [
    {
      id: 'c0000000-0000-0000-0000-000000000001',
      nama: 'XII TPM 1',
      kode: 'TPM1A1',
      guru_id: '11111111-1111-1111-1111-111111111111',
      guru_nama: 'Pak Guru',
      tingkat: 'XII',
      kompetensi: 'Teknik Pemesinan',
      tahun_ajaran: '2026/2027',
      deskripsi: 'Rombel pembubutan CNC program keahlian Teknik Pemesinan.',
      anggota_count: 28,
      anggota: [
        { id: '22222222-2222-2222-2222-222222222222', nama: 'Andi Siswa', nis: '1001', email: 'andi@murid.sch.id' }
      ]
    }
  ];

  let programs = [
    {
      id: 'p1',
      nama: 'Contoh Bubut Tirus Ø20',
      gcode: 'G90\nG00 X40 Z0\nG01 X20 Z-40 F100\nG00 X50 Z5',
      stock_diameter: 40,
      stock_panjang: 60,
      target_diameter: 20,
      target_panjang: 40,
      disimpan_pada: '2026-11-08 14:00:00'
    }
  ];

  const tugasList = [
    {
      id: 'f0000000-0000-0000-0000-000000000001',
      kelas_id: 'c0000000-0000-0000-0000-000000000001',
      kelas_nama: 'XII TPM 1',
      modul_id: 'a0000000-0000-0000-0000-000000000002',
      judul: 'Tugas 1: Pembubutan tirus Ø40 menjadi Ø20',
      instruksi: 'Susun program G-Code untuk meniruskan stock Ø40 L60 menjadi Ø20 sepanjang 40 mm. Jalankan simulasi lebih dulu, periksa tabrakan, lalu kirim hasilnya.',
      jenis: 'praktik',
      poin: 100,
      batas_lulus: 70,
      tenggat: '2026-11-20 23:59:59',
      status: 'terbit',
      starter_gcode: 'G90\nG00 X40 Z0\nG01 X20 Z-40 F100\nG00 X50 Z5',
      target: { stock_d: 40, stock_l: 60, target_d: 20, target_z: 40 },
      punya_saya: {
        status: 'dinilai',
        skor: 95,
        nilai: 95,
        catatan_guru: 'Bagus sekali! Jalur pahat aman dan halus.'
      }
    },
    {
      id: 'f0000000-0000-0000-0000-000000000002',
      kelas_id: 'c0000000-0000-0000-0000-000000000001',
      kelas_nama: 'XII TPM 1',
      judul: 'Kuis 1: Dasar pemrograman bubut CNC',
      instruksi: 'Kerjakan seluruh soal. Soal praktik dikerjakan langsung di simulator.',
      jenis: 'kuis',
      poin: 40,
      batas_lulus: 60,
      tenggat: '2026-11-22 23:59:59',
      status: 'terbit',
      punya_saya: {
        status: 'dinilai',
        skor: 40,
        nilai: 100
      },
      soal: [
        {
          id: 'g1',
          tipe: 'pg',
          teks: 'Pada pemrograman bubut CNC, nilai X menyatakan apa?',
          opsi: ['Diameter benda kerja', 'Radius benda kerja', 'Panjang benda kerja', 'Putaran spindle'],
          poin: 10
        },
        {
          id: 'g2',
          tipe: 'benar_salah',
          teks: 'Gerak cepat G00 aman dipakai melintasi jalur yang masih ada materialnya.',
          opsi: ['Benar', 'Salah'],
          poin: 10
        }
      ]
    }
  ];

  let currentUser = users['andi@murid.sch.id'];

  return {
    name: 'mock-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next();

        const url = new URL(req.url, 'http://localhost');
        const pathname = url.pathname;
        const method = req.method;

        // Parse JSON body jika ada
        let body = null;
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
          body = await new Promise((resolve) => {
            let data = '';
            req.on('data', (chunk) => { data += chunk; });
            req.on('end', () => {
              try { resolve(data ? JSON.parse(data) : {}); }
              catch { resolve({}); }
            });
          });
        }

        const reply = (status, data) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };

        // 1. Auth routes
        if (pathname === '/api/login' && method === 'POST') {
          const email = (body?.email || '').trim().toLowerCase();
          const u = users[email] || Object.values(users).find((x) => x.email.toLowerCase() === email) || {
            id: 'mock-user-custom',
            username: email.split('@')[0],
            nama: email.split('@')[0],
            email,
            role: email.includes('admin') ? 'admin' : email.includes('guru') ? 'guru' : 'siswa',
            kelas: 'XII TPM 1',
            status: 'aktif'
          };
          currentUser = u;
          return reply(200, { token: 'mock-jwt-token-' + u.role, user: u });
        }

        if (pathname === '/api/register' && method === 'POST') {
          const u = {
            id: 'mock-user-' + Date.now(),
            nama: body?.nama || 'Siswa Baru',
            email: body?.email || 'siswa@murid.sch.id',
            role: 'siswa',
            status: 'aktif'
          };
          currentUser = u;
          return reply(200, { token: 'mock-jwt-token-siswa', user: u });
        }

        if (pathname === '/api/logout') {
          currentUser = null;
          return reply(200, { ok: true });
        }

        if (pathname === '/api/me') {
          if (!currentUser) return reply(401, { error: 'Belum login' });
          if (method === 'PUT' && body) {
            currentUser = { ...currentUser, ...body };
          }
          return reply(200, currentUser);
        }

        // 2. Modul pustaka
        if (pathname === '/api/modules') {
          return reply(200, modules);
        }

        // 3. Stats
        if (pathname === '/api/stats/siswa') {
          return reply(200, {
            tugas_aktif: tugasList.length,
            perlu_dikerjakan: 0,
            rata_nilai: 92,
            total: 4,
            tuntas: 4,
            tenggat_dekat: []
          });
        }

        if (pathname === '/api/stats/guru') {
          return reply(200, {
            tugas_terbit: tugasList.length,
            menunggu_dinilai: 0,
            rata_nilai: 88,
            siswa_aktif: 28
          });
        }

        if (pathname === '/api/stats/admin') {
          return reply(200, {
            pengguna: { admin: 1, guru: 2, siswa: 28 },
            rombel: 1,
            tugas: 2,
            pengumpulan: { dinilai: 56, total: 56 },
            rata_nilai_sekolah: 90,
            simulasi: 124
          });
        }

        // 4. Tugas & Kelas
        if (pathname === '/api/tugas' || pathname === '/api/tugas/saya') {
          return reply(200, tugasList);
        }

        if (pathname.startsWith('/api/tugas/')) {
          const id = pathname.replace('/api/tugas/', '');
          const t = tugasList.find((x) => x.id === id) || tugasList[0];
          return reply(200, t);
        }

        if (pathname === '/api/kelas') {
          return reply(200, kelasList);
        }

        if (pathname.startsWith('/api/kelas/')) {
          return reply(200, kelasList[0]);
        }

        if (pathname === '/api/materi') {
          return reply(200, [
            {
              id: 'm1',
              judul: 'Pengenalan Sumbu X dan Z Bubut CNC',
              tipe: 'teks',
              isi: 'Sumbu X menyatakan diameter dan Z menyatakan panjang aksial.',
              urutan: 1
            }
          ]);
        }

        // 5. Program pribadi
        if (pathname === '/api/programs') {
          if (method === 'POST') {
            const p = {
              id: 'p' + Date.now(),
              nama: body?.nama || 'Program Baru',
              gcode: body?.gcode || '',
              stock_diameter: body?.stock_diameter || 40,
              stock_panjang: body?.stock_panjang || 60,
              target_diameter: body?.target_diameter || 20,
              target_panjang: body?.target_panjang || 40,
              disimpan_pada: new Date().toISOString()
            };
            programs.push(p);
            return reply(200, p);
          }
          return reply(200, programs);
        }

        if (pathname.startsWith('/api/programs/')) {
          const pid = pathname.replace('/api/programs/', '');
          if (method === 'DELETE') {
            programs = programs.filter((p) => p.id !== pid);
            return reply(200, { ok: true });
          }
          return reply(200, programs.find((p) => p.id === pid) || programs[0]);
        }

        // 6. Attempts & Nilai
        if (pathname === '/api/attempts') {
          return reply(200, {
            id: 'att-' + Date.now(),
            skor: 95,
            ada_error: false,
            match: true
          });
        }

        if (pathname === '/api/nilai/saya') {
          return reply(200, tugasList.map((t) => ({ ...t, nilai: t.punya_saya?.nilai || 90 })));
        }

        // 7. AI Tutor
        if (pathname === '/api/ai-tutor') {
          const isGuru = currentUser?.role === 'guru';
          const q = (body?.gcode || '').toLowerCase();

          if (isGuru) {
            return reply(200, {
              source: 'ai-mock',
              feedback: [
                'Halo Bapak/Ibu Guru! Berikut draf tugas praktik siap pakai:',
                '**Judul Tugas**: Pembubutan Bertingkat & Chamfer (Ø20 x Z-40)\n**Bahan Baku (Stock)**: Ø 40 mm, Panjang 60 mm\n**Target Pembubutan**: Ø 20 mm sepanjang Z-40 mm\n**Starter G-Code**:\nG90\nG00 X40 Z2\nG01 X30 Z-20 F100\nG01 X20 Z-40 F80\nG00 X50 Z5\n\n**Rubrik Penilaian**: Ketepatan diameter (40%), kehalusan feed rate (30%), dan keselamatan lintasan tanpa tabrakan (30%).',
                'Silakan klik "Salin Draf" di bawah ini lalu tempelkan ke menu "Susun Tugas Baru".'
              ]
            });
          }

          return reply(200, {
            source: 'ai-mock',
            feedback: [
              'Halo Andi! CNC-Bot melihat kode G-Code kamu sudah rapi.',
              'Ingat bahwa koordinat X selalu menyatakan ukuran diameter, dan pastikan pahat ditarik menjauh sebelum gerak cepat G00.',
              'Pertanyaan pemantik: Menurutmu apakah feed rate F100 sudah cukup halus untuk penyayatan akhir (finishing)?'
            ]
          });
        }

        // Default fallback
        return reply(200, []);
      });
    }
  };
}
