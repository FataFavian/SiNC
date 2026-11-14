// =============================================================
// Cnc3DExample.jsx - Simulator Bebas CNC 3D (Mode Demo Publik).
// Dibuka tanpa login di /?demo=3d.
// Menggunakan layout yang sama persis dengan Simulator Bebas di role siswa:
// Editor G-Code + Pratinjau Benda Kerja 3D Real-time, tanpa tombol lemari program.
// Kode contoh tetap ditampilkan agar pengunjung/pemula bisa langsung mencoba.
// =============================================================
import { useState } from 'react';
import Simulator from '../components/Simulator.jsx';
import Icon from '../ui/Icon.jsx';
import { Badge, PageHeader } from '../ui/primitives.jsx';
import sincLogo from '../assets/sinc-logo.png';

const DEMO_PRESETS = [
  {
    id: 'facing-lurus',
    judul: 'Contoh 1: Facing + Bubut Lurus (Standar)',
    deskripsi: 'Program dasar facing ujung benda kerja dan pembubutan diameter lurus.',
    starter_gcode: 'G90\nG00 X32 Z2\nG01 X20 Z0 F80\nG01 X20 Z-25 F100\nG00 X32\nG00 Z5\nM30',
    target: { stock_d: 30, stock_l: 60, target_d: 20, target_z: 25 },
  },
  {
    id: 'radius',
    judul: 'Contoh 2: Bubut Radius Cekung (G03)',
    deskripsi: 'Pengerjaan kontur lengkung radius R10 menggunakan interpolasi melingkar G03.',
    starter_gcode: 'G90\nG00 X30 Z2\nG01 X24 Z0 F90\nG01 X24 Z-8 F80\nG03 X16 Z-18 R10 F80\nG01 X16 Z-25 F80\nG00 X32\nG00 Z5\nM30',
    target: { stock_d: 30, stock_l: 60, target_d: 16, target_z: 25 },
  },
  {
    id: 'multi-pass',
    judul: 'Contoh 3: Pembubutan Bertingkat (Multi-Pass)',
    deskripsi: 'Pengurangan material secara bertingkat beberapa pass hingga mencapai dimensi akhir.',
    starter_gcode: 'G90\nG00 X32 Z2\nG01 X26 Z0 F90\nG01 X26 Z-15 F90\nG00 X32\nG00 Z2\nG01 X18 Z0 F90\nG01 X18 Z-25 F90\nG00 X32\nG00 Z5\nM30',
    target: { stock_d: 30, stock_l: 60, target_d: 18, target_z: 25 },
  },
  {
    id: 'tabrakan-chuck',
    judul: 'Contoh 4: Uji Tabrakan Pahat ke Cekam (Crash Alarm)',
    deskripsi: 'Simulasi darurat pengaman mesin: pahat membubut terlalu dalam dan menabrak rahang cekam chuck.',
    starter_gcode: '; Program Demonstrasi Tabrakan Pahat vs Cekam Chuck\n; Panjang benda kerja aman sampai Z-30 mm\n; Baris di bawah sengaja melaju tembus hingga menabrak rahang cekam!\nG90\nG00 X28 Z2\nG01 X20 Z0 F100\nG01 X20 Z-68 F120 ; <-- Menabrak rahang cekam chuck di Z-68!\nG00 X35\nG00 Z5\nM30',
    target: { stock_d: 30, stock_l: 60, target_d: 20, target_z: 30 },
  },
  {
    id: 'bebas',
    judul: 'Mode Bebas (Eksperimen Kode Sendiri)',
    deskripsi: 'Rancang kode G-Code dan uji pergerakan pahat secara bebas tanpa batasan target.',
    starter_gcode: 'G90\nG00 X32 Z2\nG01 X22 Z0 F100\nG01 X22 Z-25 F100\nG00 X32\nG00 Z5\nM30',
    target: { stock_d: 30, stock_l: 60, target_d: 22, target_z: 25 },
  },
];

export default function Cnc3DExample() {
  const [pilihId, setPilihId] = useState('facing-lurus');
  const [stockD, setStockD] = useState(30);
  const [stockL, setStockL] = useState(60);

  const aktif = DEMO_PRESETS.find((p) => p.id === pilihId) || DEMO_PRESETS[0];

  const gantiPreset = (id) => {
    setPilihId(id);
    const p = DEMO_PRESETS.find((x) => x.id === id);
    if (p) {
      setStockD(p.target.stock_d);
      setStockL(p.target.stock_l);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Topbar Navigasi Publik */}
      <header
        style={{
          height: 60,
          padding: '0 24px',
          background: 'var(--topbar-bg)',
          borderBottom: '1px solid var(--topbar-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={sincLogo} alt="SiNC" style={{ width: 34, height: 34, borderRadius: 10, display: 'block' }} />
          <div>
            <b style={{ fontSize: 16, color: 'var(--text-strong)', letterSpacing: '-0.01em' }}>
              S<span style={{ color: 'var(--accent)' }}>i</span>NC
            </b>
            <span className="dim" style={{ fontSize: 11, marginLeft: 8, textTransform: 'uppercase', letterSpacing: '.1em' }}>
              Simulator CNC
            </span>
          </div>
          <span className="chip chip--accent" style={{ marginLeft: 8 }}>
            Demo Tanpa Akun
          </span>
        </div>

        <a
          href="/"
          className="btn btn--primary btn--sm"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Icon name="arrow-left" size={14} />
          <span>Masuk ke Akun LMS</span>
        </a>
      </header>

      {/* Konten Utama */}
      <main className="content content--wide" style={{ padding: '24px 28px 48px', flex: 1 }}>
        <PageHeader
          title="Simulator Bebas (Demo Langsung)"
          desc="Eksplorasi kode G-Code, uji pergerakan pahat, dan saksikan pemotongan bubut 3D secara bebas tanpa perlu login."
          actions={
            <div className="u-row" style={{ gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="dim" style={{ fontSize: 12 }}>Contoh Program:</span>
              <select
                value={pilihId}
                onChange={(e) => gantiPreset(e.target.value)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 8,
                  fontSize: 12,
                  background: 'var(--surface-2)',
                  color: 'var(--text)',
                  border: '1px solid var(--line-2)',
                  cursor: 'pointer',
                  maxWidth: 280,
                }}
              >
                {DEMO_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.judul}
                  </option>
                ))}
              </select>
            </div>
          }
          badge={<Badge tone="accent" icon="cube">{aktif.judul}</Badge>}
        />

        <Simulator
          key={aktif.id}
          modul={aktif}
          initialStockD={stockD}
          initialStockL={stockL}
          bolehSimpan={false}
          showTutor={false}
          onStockChange={(d, l) => {
            setStockD(d);
            setStockL(l);
          }}
        />
      </main>
    </div>
  );
}
