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
  ['class', 'Rombel terstruktur', 'Guru membuat rombel, mengisi anggota lewat impor NIS massal atau kode gabung kelas.'],
  ['assignment', 'Tugas praktik & kuis', 'Tugas G-Code dinilai otomatis oleh mesin simulasi; kuis pilihan ganda, benar/salah, dan isian dinilai seketika.'],
  ['cube', 'Simulator 3D', 'Siswa merancang G-Code, menjalankannya pada mesin bubut 3D, lalu mengumpulkan hasil simulasi.'],
  ['chart', 'Penilaian & rekap', 'Guru memberi nilai dan catatan, rekap per rombel dan sekap sekolah siap diunduh sebagai CSV.'],
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
            <img src={sincLogo} alt="SiNC" style={{ width: 44, height: 44, borderRadius: 12, display: 'block' }} />
          </span>
          <div>
            <b style={{ fontSize: 18, letterSpacing: '-0.01em' }}>S<span style={{ color: 'var(--accent)' }}>i</span>NC</b>
            <div className="dim" style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase' }}>Simulator CNC</div>
          </div>
        </div>

        <h2>Belajar pemrograman bubut CNC sampai benar-benar terampil</h2>
        <p className="dim" style={{ maxWidth: 520 }}>
          Satu ruang belajar untuk admin, guru, dan siswa: materi, tugas praktik G-Code,
          simulator mesin 3D, kuis otomatis, dan rekap nilai dalam satu aplikasi.
        </p>

        <div className="auth__list">
          {VALUE.map(([icon, judul, teks]) => (
            <div className="auth__li" key={judul}>
              <Icon name={icon} size={18} />
              <span><b style={{ display: 'block', color: '#eaf1f7' }}>{judul}</b>{teks}</span>
            </div>
          ))}
        </div>

        <div className="auth__foot">
          <span className="dim" style={{ fontSize: 12 }}>Platform LMS & Simulator Pembelajaran CNC</span>
        </div>
      </section>

      <section className="auth__panel">
        <form className="auth-card" onSubmit={kirim}>
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

          <div className="auth-card__demo-divider" style={{ borderTop: '1px solid rgba(245, 238, 226, 0.16)', margin: '14px 0 10px', position: 'relative', textAlign: 'center' }}>
            <span style={{ position: 'relative', top: -9, background: 'rgba(17, 26, 45, 0.95)', padding: '0 10px', fontSize: 11.5, color: 'var(--muted)' }}>
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
                color: 'var(--text-strong, #fffdf8)',
                background: 'rgba(245, 238, 226, 0.08)',
                border: '1px solid rgba(245, 238, 226, 0.24)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
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
