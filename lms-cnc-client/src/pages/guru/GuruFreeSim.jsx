// =============================================================
// GuruFreeSim.jsx - simulator bebas terintegrasi untuk Guru.
// Guru dapat mengeksplorasi G-Code, menguji mesin 3D real-time,
// dan langsung mengonversinya menjadi tugas praktik untuk siswa
// lewat tombol "Jadikan sebagai tugas".
// =============================================================
import { useMemo, useState } from 'react';
import { api } from '../../api';
import { navigate } from '../../router';
import Icon from '../../ui/Icon.jsx';
import { Alert, Badge, Button, PageHeader } from '../../ui/primitives.jsx';
import { useAsync } from '../../ui/hooks.jsx';
import Simulator from '../../components/Simulator.jsx';

const KOSONG = { judul: '', level: '', deskripsi: '', target: null, starter_gcode: '' };

export default function GuruFreeSim() {
  const modul = useAsync(() => api('/api/modules'), []);
  const [pilih, setPilih] = useState('');
  const [bebasStockD, setBebasStockD] = useState(30);
  const [bebasStockL, setBebasStockL] = useState(60);
  const [currentGcode, setCurrentGcode] = useState('');

  const daftar = useMemo(
    () => (modul.data || []).slice().sort((a, b) => a.level - b.level || a.judul.localeCompare(b.judul)),
    [modul.data]
  );

  const aktif = daftar.find((m) => m.id === pilih) || KOSONG;
  const targetAktif = aktif.target || {
    stock_d: bebasStockD,
    stock_l: bebasStockL,
    target_d: Math.round(bebasStockD / 2),
    target_z: Math.round(bebasStockL * 0.6),
  };

  const gantiPilihan = (value) => {
    setPilih(value);
  };

  const jadikanSebagaiTugas = () => {
    const draft = {
      judul: aktif.judul ? `Tugas Praktik: ${aktif.judul}` : 'Tugas Praktik Bubut CNC',
      stock_d: targetAktif.stock_d || bebasStockD,
      stock_l: targetAktif.stock_l || bebasStockL,
      target_d: targetAktif.target_d || Math.round(bebasStockD / 2),
      target_z: targetAktif.target_z || Math.round(bebasStockL * 0.6),
      starter_gcode: currentGcode || aktif.starter_gcode || '',
    };
    try {
      sessionStorage.setItem('sinc_draft_task_sim', JSON.stringify(draft));
    } catch (_) {}
    navigate('/guru/tugas/baru');
  };

  return (
    <>
      <PageHeader
        title="Simulator Bebas"
        desc="Rancang kode G-Code, periksa visualisasi pemesinan 3D, atau buat tugas praktik baru untuk siswa langsung dari simulasi ini."
        actions={
          <div className="u-row" style={{ gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="u-row" style={{ gap: 6, alignItems: 'center' }}>
              <span className="dim" style={{ fontSize: 12 }}>Template Modul:</span>
              <select
                value={pilih}
                onChange={(e) => gantiPilihan(e.target.value)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 8,
                  fontSize: 12,
                  background: 'var(--surface-2)',
                  color: 'var(--text)',
                  border: '1px solid var(--line-2)',
                  cursor: 'pointer',
                  maxWidth: 220,
                }}
              >
                <option value="">Mode Bebas (Rancang Sendiri)</option>
                {daftar.map((m) => (
                  <option key={m.id} value={m.id}>
                    Lv.{m.level} • {m.judul}
                  </option>
                ))}
              </select>
            </div>

            <Button
              icon="plus"
              onClick={jadikanSebagaiTugas}
              title="Gunakan konfigurasi G-Code dan stock saat ini untuk membuat tugas baru"
            >
              Jadikan sebagai tugas
            </Button>
          </div>
        }
        badge={<>
          {aktif.level && <Badge tone="accent" icon="layers">Lv.{aktif.level} • {aktif.judul}</Badge>}
        </>}
      />

      {modul.error && <Alert tone="danger" title="Modul tidak tersedia">{modul.error}</Alert>}

      <Simulator
        key={aktif.id || 'bebas-guru'}
        modul={aktif.id ? aktif : null}
        idModul={aktif.id || null}
        initialStockD={bebasStockD}
        initialStockL={bebasStockL}
        bolehSimpan={false}
        showTutor={false}
        onStockChange={(d, l) => {
          setBebasStockD(d);
          setBebasStockL(l);
        }}
        onGcodeChange={(gc) => setCurrentGcode(gc)}
        onRekomendasi={(id) => gantiPilihan(String(id))}
      />
    </>
  );
}
