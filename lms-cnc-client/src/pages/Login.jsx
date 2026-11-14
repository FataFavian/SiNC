// =============================================================
// Login.jsx - layar masuk & daftar. Panel kiri menjelaskan isi LMS,
// panel kanan berisi formulir. Tanpa emoji, tanpa em dash.
// =============================================================
import { useState } from 'react';
import { navigate } from '../router';
import { useSession } from '../session';
import Icon from '../ui/Icon.jsx';
import sincLogo from '../assets/sinc-logo.png';
import { Alert, Button, Field, Input } from '../ui/primitives.jsx';

const DEMO = [
  ['Administrator', 'admin@smk.sch.id'],
  ['Guru', 'guru@smk.sch.id'],
  ['Siswa', 'andi@murid.sch.id'],
];

const VALUE = [
  {
    icon: 'class',
    judul: 'Rombel Terstruktur',
    teks: 'Guru membuat rombel, mengisi anggota lewat impor NIS massal atau kode gabung kelas secara instan.',
    color: 'orange',
  },
  {
    icon: 'check-circle',
    judul: 'Tugas Praktik & Kuis',
    teks: 'G-Code dinilai otomatis oleh mesin evaluasi syntax; kuis pilihan ganda dan isian dinilai seketika.',
    color: 'green',
  },
  {
    icon: 'cube',
    judul: 'Simulator Mesin 3D',
    teks: 'Siswa merancang lintasan pahat, menjalankan pembubutan 3D bebas tabrakan, lalu mengumpulkan hasil kerja.',
    color: 'amber',
  },
  {
    icon: 'chart',
    judul: 'Penilaian & Rekap Otomatis',
    teks: 'Guru memberi feedback, rekapitulasi portofolio per kelas siap unduh dalam format CSV/Excel untuk e-Rapor.',
    color: 'cyan',
  },
];

export default function Login() {
  const { login, daftar } = useSession();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ nama: '', email: '', password: '', kelas: '', kode: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const kirim = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      if (mode === 'login') await login(form.email.trim(), form.password);
      else await daftar({
        nama: form.nama.trim(),
        email: form.email.trim(),
        password: form.password,
        kelas: form.kelas.trim() || undefined,
        kode: form.kode.trim() || undefined,
      });
      navigate('/');
    } catch (ex) {
      setErr(ex.message);
    }
    setBusy(false);
  };

  return (
    <div className="auth">
      <section className="auth__aside">
        <div className="auth__brand">
          <span className="auth__mark" style={{ background: 'transparent', padding: 0, overflow: 'hidden' }}>
            <img src={sincLogo} alt="SiNC" style={{ width: 42, height: 42, borderRadius: 12, display: 'block' }} />
          </span>
          <div>
            <b style={{ fontSize: 18, letterSpacing: '-0.02em', color: '#ffffff', display: 'block' }}>
              S<span style={{ color: 'var(--accent)' }}>i</span>NC
            </b>
            <div className="dim" style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase' }}>Simulator CNC</div>
          </div>
        </div>

        <h2 className="auth__hero-title">
          Belajar pemrograman bubut CNC sampai <span className="auth__hero-accent">benar–benar terampil.</span>
        </h2>
        <p className="auth__hero-sub">
          Simulator bubut CNC berbasis web dengan LMS ringan dan AI Tutor untuk pembelajaran G-Code.
        </p>

        <div className="auth__grid">
          {VALUE.map((item) => (
            <div className="auth__feature-card" key={item.judul}>
              <div className={`auth__feature-icon auth__feature-icon--${item.color}`}>
                <Icon name={item.icon} size={18} />
              </div>
              <b className="auth__feature-title">{item.judul}</b>
              <p className="auth__feature-desc">{item.teks}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="auth__panel">
        <form className="auth-card" onSubmit={kirim}>
          <div className="auth-card-brand">
            <img src={sincLogo} alt="SiNC" />
            <div className="auth-card-brand__info">
              <b className="auth-card-brand__title">S<span className="auth-card-brand__dot">i</span>NC</b>
              <span className="auth-card-brand__sub">Simulator CNC</span>
            </div>
          </div>
          <h1>{mode === 'login' ? 'Masuk ke akun' : 'Daftar sebagai siswa'}</h1>
          <p className="dim">{mode === 'login'
            ? 'Gunakan email dan password yang telah didaftarkan.'
            : 'Akun baru selalu berperan siswa. Isi kode rombel untuk langsung bergabung.'}</p>

          <div className="auth-switch">
            <button type="button" className={mode === 'login' ? 'is-active' : ''} onClick={() => { setMode('login'); setErr(''); }}>Login</button>
            <button type="button" className={mode === 'register' ? 'is-active' : ''} onClick={() => { setMode('register'); setErr(''); }}>Daftar</button>
          </div>

          {mode === 'register' && (
            <Field label="Nama lengkap" required>
              <Input className="input" value={form.nama} onChange={set('nama')} placeholder="Nama sesuai rapor" autoComplete="name" />
            </Field>
          )}

          <Field label="Email" required>
            <Input className="input" type="email" value={form.email} onChange={set('email')} placeholder="nama@smk.sch.id" autoComplete="email" required />
          </Field>

          <Field label="Password" required hint={mode === 'register' ? 'Minimal 6 karakter.' : undefined}>
            <Input className="input" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
          </Field>

          {mode === 'register' && (
            <div className="form-grid">
              <Field label="Kelas (opsional)">
                <Input className="input" value={form.kelas} onChange={set('kelas')} placeholder="XII TPM 1" />
              </Field>
              <Field label="Kode rombel (opsional)">
                <Input className="input" value={form.kode} onChange={set('kode')} placeholder="mis. K8X2QA" style={{ textTransform: 'uppercase' }} />
              </Field>
            </div>
          )}

          {err && <Alert tone="danger" title="Gagal masuk">{err}</Alert>}

          <Button type="submit" size="lg" icon={mode === 'login' ? 'login' : 'plus'} loading={busy} className="btn--block">
            {mode === 'login' ? 'Masuk' : 'Buat akun'}
          </Button>

          <div className="auth-card__demo-divider" style={{ borderTop: '1px solid var(--line)', margin: '14px 0 10px', position: 'relative', textAlign: 'center' }}>
            <span style={{ position: 'relative', top: -9, background: 'var(--card-bg, #ffffff)', padding: '0 10px', fontSize: 11.5, color: 'var(--muted)' }}>
              atau coba tanpa akun
            </span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <a
              className="btn btn--block"
              href="?demo=3d"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                padding: '8px 14px',
                borderRadius: 9,
                fontSize: 12.5,
                fontWeight: 600,
                textDecoration: 'none',
                color: 'var(--text-strong)',
                background: 'var(--surface-2, #f8fafc)',
                border: '1px solid var(--line)',
                boxShadow: 'var(--sh-1)'
              }}
            >
              <Icon name="cube" size={15} style={{ color: 'var(--muted)' }} />
              Coba Simulator Mesin 3D (Demo Langsung)
            </a>
          </div>
        </form>
      </section>
    </div>
  );
}

export { DEMO };
