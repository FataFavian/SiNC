// =============================================================
// SiswaFreeSim.jsx - simulator bebas untuk siswa: langsung ke editor
// dan pratinjau benda kerja 3D tanpa kartu instruksi yang padat.
// Siswa dapat memilih modul latihan, program tersimpan, atau
// langsung bereksperimen bebas dengan ukuran stock kustom.
// =============================================================
import { useMemo, useState } from 'react';
import { api } from '../../api';
import { Link, navigate } from '../../router';
import Icon from '../../ui/Icon.jsx';
import { Alert, Badge, PageHeader } from '../../ui/primitives.jsx';
import { useAsync } from '../../ui/hooks.jsx';
import Simulator from '../../components/Simulator.jsx';

const KOSONG = { judul: '', level: '', deskripsi: '', target: null, starter_gcode: '' };

// program tersimpan siswa → bentuk modul supaya Simulator bisa memakainya
function dariProgram(p) {
  return {
    id: 'program:' + p.id,
    judul: p.nama,
    level: '',
    deskripsi: 'Program tersimpan dari lemari Anda.',
    starter_gcode: p.gcode,
    target: {
      stock_d: +p.stock_diameter,
      stock_l: +p.stock_panjang,
      target_d: +p.target_diameter,
      target_z: +p.target_panjang,
    },
  };
}

export default function SiswaFreeSim({ programId }) {
  const modul = useAsync(() => api('/api/modules'), []);
  const simpanan = useAsync(() => (programId ? api('/api/programs') : Promise.resolve([])), [programId]);
  const [pilih, setPilih] = useState('');
  const [bebasStockD, setBebasStockD] = useState(30);
  const [bebasStockL, setBebasStockL] = useState(60);

  const daftar = useMemo(
    () => (modul.data || []).slice().sort((a, b) => a.level - b.level || a.judul.localeCompare(b.judul)),
    [modul.data]
  );
  const program = useMemo(
    () => (programId ? (simpanan.data || []).find((p) => p.id === programId) : null),
    [simpanan.data, programId]
  );

  const aktif = program ? dariProgram(program) : (daftar.find((m) => m.id === pilih) || KOSONG);
  const targetAktif = aktif.target || {
    stock_d: bebasStockD,
    stock_l: bebasStockL,
    target_d: Math.round(bebasStockD / 2),
    target_z: Math.round(bebasStockL * 0.6),
  };

  const gantiPilihan = (value) => {
    setPilih(value);
    if (programId) navigate('/siswa/latihan', { replace: true });
  };

  return (
    <>
      <PageHeader
        title="Simulator Bebas"
        desc="Eksplorasi kode G-Code, uji program, dan lihat pemotongan 3D secara bebas dan menyenangkan tanpa penilaian."
        actions={
          <div className="u-row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <div className="u-row" style={{ gap: 6, alignItems: 'center' }}>
              <span className="dim" style={{ fontSize: 12 }}>Template/Modul:</span>
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
                <option value="">{program ? program.nama : 'Mode Bebas (Eksperimen Sendiri)'}</option>
                {daftar.map((m) => (
                  <option key={m.id} value={m.id}>
                    Lv.{m.level} • {m.judul}
                  </option>
                ))}
              </select>
            </div>
            <Link
              to="/siswa/program"
              className="btn btn--sec btn--sm"
              title="Buka koleksi program tersimpan"
            >
              <Icon name="folder" size={13} />
              <span>Lemari program</span>
            </Link>
          </div>
        }
        badge={<>
          {program && <Badge tone="accent" icon="code">Program: {program.nama}</Badge>}
          {aktif.level && <Badge tone="accent" icon="layers">Lv.{aktif.level} • {aktif.judul}</Badge>}
        </>}
      />

      {modul.error && <Alert tone="danger" title="Modul tidak tersedia">{modul.error}</Alert>}
      {programId && simpanan.data && !program && (
        <Alert tone="warn" title="Program tidak ditemukan">
          Program itu sudah dihapus atau bukan milik Anda. Simulator memakai program contoh.
        </Alert>
      )}

      <Simulator
        key={program ? program.id : (aktif.id || 'bebas')}
        modul={aktif.id ? aktif : null}
        idModul={program ? null : (aktif.id || null)}
        programId={program ? program.id : null}
        programNama={program ? program.nama : ''}
        initialStockD={bebasStockD}
        initialStockL={bebasStockL}
        showTutor={false}
        onStockChange={(d, l) => {
          setBebasStockD(d);
          setBebasStockL(l);
        }}
        onRekomendasi={(id) => gantiPilihan(String(id))}
      />
    </>
  );
}
