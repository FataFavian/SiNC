// =============================================================
// Simulator.jsx - simulator utama bubut CNC: editor G-Code, pratinjau 3D
// real-time, kontrol pemesinan ringkas (Animasi, Jalankan penuh, Kecepatan),
// tombol bersihkan kode, dan AI Tutor CNC-Bot.
// =============================================================
import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { api, autoScore, compareTarget, highlightGcode, parseGCode, simulate } from '../api';
import Simulator2D from './Simulator2D';
import Icon from '../ui/Icon.jsx';
import { Alert, Button, Field, Input, Modal, toast } from '../ui/primitives.jsx';

// Three.js dimuat terpisah: pengguna mode 2D tidak mengunduh chunk 3D.
const Simulator3D = lazy(() => import('./Simulator3D'));
const StandaloneWorkpiece3D = lazy(() => import('./StandaloneWorkpiece3D'));

function makeStarter(stockD = 30, stockL = 60) {
  const d = Math.round(stockD);
  const l = Math.round(stockL);
  const cutD = Math.max(10, Math.round(d * 0.6));
  const cutZ = Math.max(15, Math.round(l * 0.7));
  return `G90\nG00 X${d} Z0\nG01 X${cutD} Z-${cutZ} F100\nG00 X${d + 10}\nG00 Z5`;
}

class ViewportBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    this.props.onError?.(error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function jam(waktu) {
  if (!waktu) return null;
  const d = new Date(String(waktu).replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? String(waktu)
    : d.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Simulator({
  modul, submitTo, bolehSimpan = true, showTutor = false, idModul = null, programId = null, programNama = '',
  onSaved, onSubmit, onRekomendasi, initialStockD, initialStockL, onStockChange, onGcodeChange,
}) {
  const target = modul?.target || {
    stock_d: initialStockD || 30,
    stock_l: initialStockL || 60,
    target_d: 20,
    target_z: 40,
  };
  const [customStockD, setCustomStockD] = useState(() => initialStockD || target.stock_d || 30);
  const [customStockL, setCustomStockL] = useState(() => initialStockL || target.stock_l || 60);

  // Hanya perbarui dimensi stok jika modul/latihan berganti ID ke modul lain
  const lastModulIdRef = useRef(modul?.id);
  useEffect(() => {
    const nextId = modul?.id;
    if (nextId !== lastModulIdRef.current) {
      lastModulIdRef.current = nextId;
      if (modul?.target?.stock_d) setCustomStockD(+modul.target.stock_d);
      if (modul?.target?.stock_l) setCustomStockL(+modul.target.stock_l);
    }
  }, [modul?.id, modul?.target?.stock_d, modul?.target?.stock_l]);

  // Preload modul mesin 3D di latar belakang saat simulator dibuka
  // sehingga ketika tombol 'Jalankan' ditekan, mesin 3D langsung siap seketika tanpa jeda loading
  useEffect(() => {
    const t = setTimeout(() => {
      import('./Simulator3D').catch(() => {});
    }, 200);
    return () => clearTimeout(t);
  }, []);

  const stockD = +customStockD;
  const stockL = +customStockL;

  const [gcode, setGcode] = useState(modul?.starter_gcode || makeStarter(target.stock_d, target.stock_l));
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(null);
  const [kirim, setKirim] = useState(null);
  const [simpanForm, setSimpanForm] = useState(null);
  const [tutor, setTutor] = useState(null);
  const [busy, setBusy] = useState('');

  const [fallback, setFallback] = useState(false);
  const [fallbackNote, setFallbackNote] = useState('');
  const [speed, setSpeed] = useState(1);
  const [shot, setShot] = useState('panel');
  const [doorClosed, setDoorClosed] = useState(false);
  const [theater, setTheater] = useState(false);
  const [hasCut, setHasCut] = useState(false);

  const playheadRef = useRef(0);
  const speedRef = useRef(1);
  const doorTimerRef = useRef(0);
  const panelDelayRef = useRef(0);
  const gutterRef = useRef(null);
  const hlRef = useRef(null);
  const textareaRef = useRef(null);

  const lines = useMemo(() => gcode.split('\n'), [gcode]);
  const lineCount = lines.length;

  const handleEditorScroll = (e) => {
    const top = e.target.scrollTop;
    const left = e.target.scrollLeft;
    if (hlRef.current) {
      hlRef.current.scrollTop = top;
      hlRef.current.scrollLeft = left;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = top;
    }
  };
  speedRef.current = speed;

  const isRunView = theater && !fallback;

  useEffect(() => () => {
    clearTimeout(doorTimerRef.current);
    clearTimeout(panelDelayRef.current);
  }, []);

  // Ganti modul → isi starter_gcode, reset
  useEffect(() => {
    setGcode(modul?.starter_gcode || makeStarter(target.stock_d, target.stock_l));
    setPlaying(false);
    playheadRef.current = 0;
    setStep(0);
    setResult(null);
    setSaved(null);
    setKirim(null);
    setTutor(null);
    setFallbackNote('');
    setShot('panel');
    setTheater(false);
    setDoorClosed(false);
    setHasCut(false);
    clearTimeout(doorTimerRef.current);
    clearTimeout(panelDelayRef.current);
  }, [modul?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onGcodeChange?.(gcode);
  }, [gcode, onGcodeChange]);

  const sim = useMemo(() => {
    try {
      const parsed = parseGCode(gcode);
      const r = simulate(parsed, stockD, stockL);
      const td = Number(target?.target_d) || 0;
      const tz = Number(target?.target_z) || 0;
      let cmp = null;
      let scoreRes = { skor: 100, ada_error: false };
      if (td > 0 && tz > 0) {
        try {
          cmp = compareTarget(r.profile, td, tz);
          scoreRes = autoScore(r.events, cmp);
        } catch {
          cmp = null;
        }
      } else {
        const hasErr = r.events.some((e) => e.type === 'err');
        scoreRes = { skor: hasErr ? 0 : 100, ada_error: hasErr };
      }
      return { ...r, cmp, skor: scoreRes.skor, ada_error: scoreRes.ada_error, match: !scoreRes.ada_error && !!cmp?.match };
    } catch (err) {
      console.warn('Simulasi G-Code error:', err);
      return null;
    }
  }, [gcode, stockD, stockL, target?.target_d, target?.target_z]);

  const moves = sim?.moves || [];
  const errIdx = sim?.events.find((e) => e.type === 'err' && e.moveIndex !== undefined)?.moveIndex ?? -1;
  const stopAt = errIdx >= 0 ? Math.min(moves.length, errIdx + 1) : moves.length;
  const crashed = errIdx >= 0 && step >= errIdx + 1;

  const target3d = useMemo(
    () => ({ d: +target.target_d, z: +target.target_z }),
    [target.target_d, target.target_z]
  );

  const paused = !playing && !crashed && !!result && step < stopAt && doorClosed;
  const stopped = !playing && !crashed && !!result && step < stopAt && !doorClosed;
  const status = crashed ? 'ALARM' : playing ? 'AUTO' : paused ? 'PAUSE' : stopped ? 'STOP' : result ? 'SELESAI' : 'EDIT';

  // Loop playback animasi
  useEffect(() => {
    if (!playing || !sim || stopAt === 0) return;
    let last = performance.now();
    let raf = 0;

    function finish() {
      playheadRef.current = stopAt;
      setStep(stopAt);
      setPlaying(false);
      setResult({ events: sim.events, cmp: sim.cmp, skor: sim.skor, match: sim.match });
      setHasCut(true);
      clearTimeout(doorTimerRef.current);
      if (errIdx < 0) {
        doorTimerRef.current = setTimeout(() => setDoorClosed(false), 900);
      }

      // Notifikasi interaktif ke maskot AI CNC-Bot
      if (errIdx >= 0) {
        const errEvent = sim.events.find((e) => e.type === 'err');
        const detailMsg = errEvent?.message || 'Pahat menabrak benda kerja pada lintasan cepat.';
        window.dispatchEvent(new CustomEvent('cnc:bot-bubble', {
          detail: {
            type: 'crash',
            text: `⚠️ Tabrakan terdeteksi! ${detailMsg} Periksa kembali koordinat pemotongan atau mundurkan pahat ya!`,
            anim: 'think',
          }
        }));
      } else {
        const isMatch = sim.match;
        const msg = isTugas
          ? (isMatch
            ? '🎉 Hebat sekali! Dimensi benda kerja sesuai target 100% dan pemotongan aman tanpa tabrakan!'
            : '✨ Pemotongan selesai dengan aman tanpa tabrakan! Periksa ukuran diameter agar sesuai target tugas ya.')
          : '✨ Keren! Pembubutan berjalan lancar dan 100% aman tanpa tabrakan. Benda kerja selesai dipotong!';
        window.dispatchEvent(new CustomEvent('cnc:bot-bubble', {
          detail: {
            type: 'success',
            text: msg,
            anim: 'cheer',
          }
        }));
      }
    }

    const loop = (now) => {
      const dt = Math.max(0, Math.min(0.25, (now - last) / 1000));
      last = now;
      let ph = Math.max(0, playheadRef.current);
      if (ph >= stopAt - 1e-9) { finish(); return; }

      const i = Math.min(Math.floor(ph), moves.length - 1);
      const m = moves[i];
      const len = Math.hypot(m.x2 - m.x1, m.z2 - m.z1);
      const baseSpeed = m.rapid ? 30 : 12; // mm/detik
      const dur = Math.max(m.rapid ? 0.6 : 1.4, Math.min(m.rapid ? 2.0 : 4.8, len / baseSpeed));

      ph = Math.min(stopAt, ph + (dt / dur) * speedRef.current);
      playheadRef.current = ph;
      const idx = Math.min(Math.floor(ph), moves.length);
      setStep((s) => (s === idx ? s : idx));

      if (ph >= stopAt - 1e-9) { finish(); return; }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, sim, stopAt, moves, errIdx]);

  const stop = () => {
    setPlaying(false);
    setDoorClosed(false);
    if (step > 0) setHasCut(true);
  };

  const handleJalankan = () => {
    if (!sim) {
      toast('Kode G-Code tidak valid atau format salah.', 'danger');
      window.dispatchEvent(new CustomEvent('cnc:bot-bubble', {
        detail: {
          type: 'crash',
          text: '⚠️ Format G-Code belum valid. Periksa kembali penulisan parameter X, Z, atau Feedrate (F) ya!',
          anim: 'think',
        }
      }));
      return;
    }
    if (stopAt === 0) {
      toast('Tambahkan baris kode gerakan pemotongan (G00/G01/G02/G03).', 'warn');
      window.dispatchEvent(new CustomEvent('cnc:bot-bubble', {
        detail: {
          type: 'warn',
          text: '⚠️ Belum ada perintah gerakan pemotongan. Tambahkan baris kode gerak seperti G00 atau G01!',
          anim: 'think',
        }
      }));
      return;
    }
    if (playing) {
      setPlaying(false);
      return;
    }
    if (playheadRef.current >= stopAt - 1e-6) {
      playheadRef.current = 0;
      setStep(0);
    }
    clearTimeout(doorTimerRef.current);
    clearTimeout(panelDelayRef.current);
    setSaved(null);
    if (!fallback) {
      setTheater(true);
      setShot('machine');
      setDoorClosed(true);
    }
    setResult({ events: sim.events, cmp: sim.cmp, skor: sim.skor, match: sim.match });
    setPlaying(true);
  };
  const play = handleJalankan;

  const returnToEdit = () => {
    setPlaying(false);
    setDoorClosed(false);
    if (step > 0 || result) setHasCut(true);
    clearTimeout(doorTimerRef.current);
    clearTimeout(panelDelayRef.current);
    setShot('panel');
    panelDelayRef.current = setTimeout(() => {
      setTheater(false);
    }, 850);
  };

  const resetWorkpiece = () => {
    setHasCut(false);
    setResult(null);
    setStep(0);
    playheadRef.current = 0;
    setPlaying(false);
    toast('Benda kerja di-reset ke bahan mentah. Ukuran stock dapat diubah kembali.');
  };

  const reset = () => {
    setPlaying(false);
    setHasCut(false);
    playheadRef.current = 0;
    setStep(0);
    setResult(null);
    setShot('panel');
    setTheater(false);
    setDoorClosed(false);
    clearTimeout(doorTimerRef.current);
    clearTimeout(panelDelayRef.current);
  };

  const changeGcode = (v) => {
    setGcode(v);
    setPlaying(false);
    setHasCut(false);
    playheadRef.current = 0;
    setStep(0);
    setResult(null);
    setSaved(null);
    setKirim(null);
    setTutor(null);
    setDoorClosed(false);
    clearTimeout(doorTimerRef.current);
  };

  const clearGcode = () => {
    changeGcode('');
    toast('Editor G-Code telah dibersihkan.');
  };

  const on3DFail = (e) => {
    console.warn('3D tidak tersedia:', e?.message || e);
    setFallback(true);
    setFallbackNote('Visualisasi 3D tidak dapat dimuat di perangkat ini, tampilan 2D dipakai otomatis.');
  };

  // Kunci scroll + tombol Esc saat mesin tampil layar penuh
  useEffect(() => {
    if (!isRunView) return undefined;
    document.body.classList.add('sim-theater');
    const onKey = (e) => {
      if (e.key === 'Escape') returnToEdit();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('sim-theater');
      window.removeEventListener('keydown', onKey);
    };
  }, [isRunView]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveAttempt = async () => {
    if (!idModul) return toast('Pilih modul latihan dulu.', 'warn');
    setBusy('save');
    try {
      const r = await api('/api/attempts', { method: 'POST', body: JSON.stringify({ modul_id: idModul, gcode }) });
      setSaved(r);
      onSaved?.();
      toast('Percobaan tersimpan di portofolio.');
    } catch (e) { toast(e.message, 'danger'); }
    setBusy('');
  };

  const kirimTugas = async () => {
    if (!sim) return toast('Program G-Code tidak valid.', 'danger');
    setBusy('kirim');
    try {
      const r = await api(`/api/tugas/${submitTo}/submit`, { method: 'POST', body: JSON.stringify({ gcode }) });
      setKirim(r);
      setResult({ events: r.events, cmp: r.compare, skor: r.skor, match: r.match });
      onSubmit?.(r);
      toast(`Terkumpul. Skor simulator ${r.skor}/100.`);
    } catch (e) { toast(e.message, 'danger'); }
    setBusy('');
  };

  const bukaSimpanProgram = () => {
    setSimpanForm({ nama: programNama || (modul?.judul ? String(modul.judul).slice(0, 60) : ''), err: '' });
  };

  const simpanProgram = async () => {
    const nama = (simpanForm?.nama || '').trim();
    if (!nama) { setSimpanForm({ ...simpanForm, nama, err: 'Nama program wajib diisi.' }); return; }
    setBusy('prog');
    try {
      await api(programId ? '/api/programs/' + programId : '/api/programs', {
        method: programId ? 'PUT' : 'POST',
        body: JSON.stringify({
          nama,
          gcode,
          stock_diameter: stockD,
          stock_panjang: stockL,
          target_diameter: +target.target_d,
          target_panjang: +target.target_z,
        }),
      });
      setSimpanForm(null);
      toast(programId ? 'Program di lemari Anda diperbarui.' : 'Program tersimpan di lemari Anda.');
    } catch (e) {
      setSimpanForm({ nama, err: e.message });
    }
    setBusy('');
  };

  const askTutor = async () => {
    setBusy('tutor');
    try {
      const r = await api('/api/ai-tutor', {
        method: 'POST',
        body: JSON.stringify({
          gcode,
          tugas_id: submitTo || null,
          modul_id: submitTo ? null : (idModul || null),
        }),
      });
      setTutor(r);
    } catch (e) {
      setTutor({ source: 'error', feedback: [e.message] });
    }
    setBusy('');
  };

  const evs = kirim?.events || saved?.events || result?.events || [];
  const hl = useMemo(() => highlightGcode(gcode), [gcode]);
  const isTugas = Boolean(submitTo);
  const shownScore = kirim?.skor ?? saved?.skor ?? result?.skor;
  const shownMatch = kirim?.match ?? saved?.match ?? result?.match;
  const shownDetail = (kirim?.compare ?? saved?.compare ?? result?.cmp)?.detail;

  const runTitle = status === 'AUTO' ? 'SIKLUS BERJALAN'
    : status === 'PAUSE' ? 'SIKLUS DIJEDA'
      : status === 'STOP' ? 'SIKLUS DIHENTIKAN'
        : status === 'ALARM' ? 'ALARM, SIKLUS DIHENTIKAN'
          : status === 'SELESAI' ? 'SIKLUS SELESAI' : 'PRATINJAU MESIN 3D';
  const runSub = status === 'AUTO' ? 'Pintu kaca tertutup • coolant menyemprot'
    : status === 'PAUSE' ? 'Siklus dijeda • pintu tetap tertutup'
      : status === 'STOP' ? 'Pintu kaca dibuka • tekan Lanjutkan untuk melanjutkan'
        : status === 'ALARM' ? 'Tabrakan terdeteksi • periksa program G-Code'
          : status === 'SELESAI' ? 'Pintu kaca terbuka • benda kerja selesai'
            : 'Mesin CNC tampil layar penuh';
  const progressPct = Math.min(100, (step / Math.max(1, moves.length)) * 100);

  return (
    <div className={`card simulator-card${theater ? ' simulator-card--running' : ''}`}>
      {!theater && (
        <>
          <h3>
            Simulator Bubut CNC{' '}
            <span className="sim-of">
              {modul ? `${modul.title || modul.judul}${modul.level ? ` (Lv.${modul.level})` : ''}` : 'mode bebas'}
            </span>
          </h3>
          {modul && (
            <p className="dim">
              {modul.description || modul.deskripsi} Target: Ø{target.target_d} / Z-{target.target_z}mm
              dari stock Ø{target.stock_d} L{target.stock_l} mm.
            </p>
          )}
        </>
      )}

      <div className={`sim-grid${theater ? ' sim-grid--run' : ''}`}>
        {/* ---------------- Kolom Kiri: Editor G-Code & Kontrol ---------------- */}
        {!theater && (
          <div className="sim-col sim-col--editor">
            <div className="sim-panel-head">
              <div className="sim-panel-head__title">
                <Icon name="code" size={15} />
                <b>Editor G-Code</b>
                <span className="sim-line-counter" title="Total baris program">
                  {lineCount} baris
                </span>
                <span className="dim">(G00, G01, G02, G03, G90, G91)</span>
              </div>
              <div className="sim-live-indicator sim-live-indicator--control" title="Status Editor & Panel Kontrol CNC">
                <span className="sim-live-dot" />
                <span>Control Panel</span>
              </div>
            </div>

            <div className="editor editor--with-gutter">
              <div className="editor__gutter" ref={gutterRef}>
                {lines.map((_, i) => (
                  <div key={i} className="editor__line-no">
                    {String(i + 1).padStart(lineCount < 100 ? 2 : String(lineCount).length, '0')}
                  </div>
                ))}
              </div>
              <div className="editor__body">
                <pre ref={hlRef} className="hl" dangerouslySetInnerHTML={{ __html: hl + '\n' }} />
                <textarea
                  ref={textareaRef}
                  value={gcode}
                  spellCheck={false}
                  onChange={(e) => changeGcode(e.target.value)}
                  onScroll={handleEditorScroll}
                  rows={14}
                  placeholder="Tulis kode G-Code di sini... (mis. G90, G00 X30 Z0, G01 X20 Z-30 F100)"
                />
              </div>
            </div>

            {/* Kontrol Utama: Jalankan (unified), Stop, Kecepatan, Bersihkan */}
            <div className="sim-controls-bar">
              <Button
                icon={playing ? 'pause' : 'play'}
                onClick={handleJalankan}
                title="Jalankan simulasi pemotongan bubut CNC"
              >
                {playing ? 'Jeda' : 'Jalankan'}
              </Button>
              <Button
                variant="sec"
                icon="stop"
                onClick={stop}
                disabled={!playing && !paused && status !== 'ALARM'}
                title="Hentikan pemotongan"
              >
                Stop
              </Button>
              <div className="sim-speed-box" title="Kecepatan animasi simulasi">
                <Icon name="bolt" size={13} />
                <select
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                >
                  <option value={0.5}>0,5×</option>
                  <option value={1}>1×</option>
                  <option value={2}>2×</option>
                  <option value={4}>4×</option>
                </select>
              </div>
              <Button variant="sec" icon="trash" onClick={clearGcode} title="Kosongkan seluruh kode di editor">
                Bersihkan
              </Button>
            </div>

            <div className="log">
              {evs.map((e, i) => <div key={i} className={e.type}>{e.msg}</div>)}
            </div>

            {isTugas && (result || saved || kirim) && (
              <div className={`score ${shownMatch ? 'match' : 'nomatch'}`}>
                Skor {shownScore}/100 {shownMatch ? 'sesuai target' : 'belum sesuai target'}
                <div className="dim">{shownDetail}</div>
              </div>
            )}
            {!isTugas && (result || saved) && (
              <div className={`score ${crashed ? 'nomatch' : 'match'}`}>
                {crashed ? 'Pahat Menabrak Benda Kerja' : 'Simulasi Bebas: Eksekusi Aman'}
                <div className="dim">
                  {crashed ? 'Pahat menabrak benda kerja pada lintasan cepat.' : 'Simulator bebas tidak dinilai. Program aman tanpa tabrakan.'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------- Kolom Kanan: Pratinjau Benda Kerja 3D Pure ---------------- */}
        <div className="sim-col sim-col--preview">
          {!theater && (
            <div className="sim-panel-head">
              <div className="sim-panel-head__title">
                <Icon name="cube" size={15} />
                <b>Pratinjau Benda Kerja 3D</b>
              </div>
              <div className="sim-live-indicator" title="Pratinjau Geometri 3D Interaktif">
                <span className="sim-live-dot" />
                <span>3D Real-Time</span>
              </div>
            </div>
          )}

          {fallback ? (
            <>
              <Simulator2D
                sim={sim}
                stockD={stockD}
                stockL={stockL}
                playheadRef={playheadRef}
                crashed={crashed}
              />
              <div className="viewport-tools">
                <span className="dim">Tampilan 2D: potongan melintang, X = diameter.</span>
              </div>
            </>
          ) : !theater ? (
            <>
              <Suspense fallback={<div className="vp3d-loading" style={{ height: 480 }}>Menyiapkan pratinjau benda kerja 3D…</div>}>
                <StandaloneWorkpiece3D stockD={stockD} stockL={stockL} height={480} cutProfile={hasCut ? sim?.profile : null} />
              </Suspense>

              <div className="viewport-tools viewport-tools--stock">
                <div className="stock-dim-group">
                  <label className="stock-dim-select-wrap">
                    <span>Diameter:</span>
                    <select
                      value={stockD}
                      disabled={hasCut}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setCustomStockD(v);
                        onStockChange?.(v, stockL);
                      }}
                      title={hasCut ? 'Tekan Reset untuk membuka kunci ukuran diameter' : 'Ubah diameter benda kerja (otomatis update 3D real-time)'}
                    >
                      <option value={20}>Ø 20 mm</option>
                      <option value={25}>Ø 25 mm</option>
                      <option value={30}>Ø 30 mm (Standar)</option>
                      <option value={32}>Ø 32 mm</option>
                      <option value={40}>Ø 40 mm</option>
                      <option value={50}>Ø 50 mm</option>
                    </select>
                  </label>

                  <label className="stock-dim-select-wrap">
                    <span>Panjang:</span>
                    <select
                      value={stockL}
                      disabled={hasCut}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setCustomStockL(v);
                        onStockChange?.(stockD, v);
                      }}
                      title={hasCut ? 'Tekan Reset untuk membuka kunci ukuran panjang' : 'Ubah panjang benda kerja (otomatis update 3D real-time)'}
                    >
                      <option value={40}>P 40 mm</option>
                      <option value={50}>P 50 mm</option>
                      <option value={60}>P 60 mm (Standar)</option>
                      <option value={80}>P 80 mm</option>
                      <option value={100}>P 100 mm</option>
                    </select>
                  </label>

                  {hasCut && (
                    <button
                      type="button"
                      className="btn-stock-reset"
                      onClick={resetWorkpiece}
                      title="Reset benda kerja kembali ke bahan mentah dan buka kunci dimensi"
                    >
                      <Icon name="restart" size={13} />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="view-stage view-stage--full">
                <ViewportBoundary onError={on3DFail}>
                  <Suspense
                    fallback={(
                      <div className="vp3d-loading" style={{ height: '100%' }}>
                        Menyiapkan simulasi mesin 3D…
                      </div>
                    )}
                  >
                    <Simulator3D
                      key={`${stockD}-${stockL}`}
                      sim={sim}
                      stockD={stockD}
                      stockL={stockL}
                      playheadRef={playheadRef}
                      crashed={crashed}
                      target={target3d}
                      showToolpath={true}
                      transparent={false}
                      targetVisible={Boolean(submitTo || modul?.id)}
                      height={480}
                      shot={shot}
                      doorClosed={doorClosed}
                      status={status}
                      onError={on3DFail}
                    />
                  </Suspense>
                </ViewportBoundary>

                {theater && !fallback && (
                  <div className="run-hud">
                    <div className="run-progress"><i style={{ width: `${progressPct}%` }} /></div>

                    <div className="run-top">
                      <div className={`run-status run-status--${status.toLowerCase()}`}>
                        <i />
                        <div>
                          <b>{runTitle}</b>
                          <span>{runSub}</span>
                        </div>
                      </div>

                      {result && (status === 'SELESAI' || status === 'ALARM') && (
                        <div style={{ marginLeft: 'auto' }}>
                          {isTugas ? (
                            <div className={`run-score ${shownMatch ? 'match' : 'nomatch'}`}>
                              <b>{shownMatch ? shownScore : shownScore}<em>/100</em></b>
                              <span>{shownMatch ? 'sesuai target' : 'belum sesuai target'}</span>
                            </div>
                          ) : (
                            <div className={`run-score ${status === 'ALARM' ? 'nomatch' : 'match'}`}>
                              <b>{status === 'ALARM' ? 'TABRAKAN' : 'AMAN'}</b>
                              <span>{status === 'ALARM' ? 'pahat menabrak' : 'tanpa tabrakan'}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="run-controls" style={{ flexWrap: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
                      <span className="run-step" style={{ whiteSpace: 'nowrap', width: 'auto', flex: 'none' }}>
                        Langkah {step}/{moves.length}
                      </span>
                      <select
                        value={speed}
                        onChange={(e) => setSpeed(Number(e.target.value))}
                        className="run-btn run-btn--speed"
                        style={{ width: 'auto', minWidth: 52, maxWidth: 62, margin: 0, flex: 'none' }}
                        title="Kecepatan animasi"
                      >
                        <option value={0.5}>0,5×</option>
                        <option value={1}>1×</option>
                        <option value={2}>2×</option>
                        <option value={4}>4×</option>
                      </select>
                      <button className="run-btn run-btn--primary" onClick={play} style={{ whiteSpace: 'nowrap', flex: 'none' }}>
                        <Icon name={status === 'AUTO' ? 'pause' : status === 'ALARM' ? 'restart' : 'play'} size={14} />
                        <span>{status === 'AUTO' ? 'Jeda'
                          : status === 'PAUSE' || status === 'STOP' ? 'Lanjutkan'
                            : status === 'ALARM' ? 'Ulangi'
                              : status === 'SELESAI' ? 'Putar ulang' : 'Jalankan'}</span>
                      </button>
                      {(playing || paused) && (
                        <button className="run-btn" onClick={stop} style={{ whiteSpace: 'nowrap', flex: 'none' }}>
                          <Icon name="stop" size={14} /><span>Stop</span>
                        </button>
                      )}
                      <button className="run-btn run-btn--return" onClick={returnToEdit} style={{ whiteSpace: 'nowrap', flex: 'none' }} title="Kembali ke mode editor G-Code">
                        <Icon name="edit" size={14} />
                        <span>Kembali edit</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {fallbackNote && <p className="fallback-note">{fallbackNote}</p>}

          {!theater && (submitTo || bolehSimpan) && (
            <div className="row wrap" style={{ marginTop: 12 }}>
              {submitTo ? (
                <Button icon="send" loading={busy === 'kirim'} onClick={kirimTugas} disabled={!sim}>
                  {kirim ? 'Kirim ulang ke guru' : 'Kirim ke guru'}
                </Button>
              ) : (
                <>
                  {bolehSimpan && (
                    <Button variant="sec" icon="save" onClick={bukaSimpanProgram}>
                      {programId ? 'Perbarui program' : 'Simpan ke program saya'}
                    </Button>
                  )}
                  {idModul && bolehSimpan && (
                    <Button variant="sec" icon="layers" loading={busy === 'save'} onClick={saveAttempt}>
                      Simpan sebagai percobaan
                    </Button>
                  )}
                </>
              )}
            </div>
          )}

          {!theater && kirim && (
            <div className={`score ${kirim.match ? 'match' : 'nomatch'}`}>
              Dikirim {jam(kirim.pengumpulan?.waktu_submit) || 'baru saja'} • skor simulator {kirim.skor}/100
              {' '}{kirim.match ? 'sesuai target' : 'belum sesuai target'}
              {kirim.ada_error ? ' • program memicu tabrakan' : ''}
              <div className="dim">{kirim.compare?.detail}</div>
              <div className="dim">
                Nilai akhir menunggu penilaian guru ({kirim.pengumpulan?.jumlah_percobaan ?? 1} percobaan terkirim).
              </div>
            </div>
          )}

          {!theater && tutor && (
            <div className="tutor">
              <b>CNC-Bot <span className="dim">({tutor.source}){isTugas && (tutor.skor != null || shownScore != null) ? ` • skor ${tutor.skor ?? shownScore}/100` : ''}</span></b>
              <ul>{tutor.feedback.map((t, i) => <li key={i} style={{ whiteSpace: 'pre-line' }}>{t}</li>)}</ul>
              {tutor.rekomendasi && (
                <button className="sec" onClick={() => onRekomendasi?.(tutor.rekomendasi.modul_id)}>
                  Modul berikutnya: Lv.{tutor.rekomendasi.level} {tutor.rekomendasi.judul}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={!!simpanForm}
        title={programId ? 'Perbarui program di lemari' : 'Simpan ke lemari program'}
        icon="code"
        width={480}
        onClose={() => setSimpanForm(null)}
        footer={<>
          <Button variant="sec" onClick={() => setSimpanForm(null)}>Batal</Button>
          <Button icon="save" loading={busy === 'prog'} onClick={simpanProgram}>Simpan program</Button>
        </>}
      >
        {simpanForm?.err && <Alert tone="danger" title="Gagal menyimpan">{simpanForm.err}</Alert>}
        <Field label="Nama program" required hint="Nama ini muncul di halaman Program saya.">
          <Input
            value={simpanForm?.nama || ''}
            maxLength={80}
            placeholder="mis. O0001 Tirus luar"
            onChange={(e) => setSimpanForm({ ...simpanForm, nama: e.target.value, err: '' })}
            onKeyDown={(e) => e.key === 'Enter' && simpanProgram()}
          />
        </Field>
        <div className="kv">
          <span>Ukuran stock</span><b className="mono">Ø{stockD} x {stockL} mm</b>
          {isTugas && <span>Target</span>}
          {isTugas && <b className="mono">Ø{target.target_d} x Z-{target.target_z} mm</b>}
          <span>Baris kode</span><b className="mono">{gcode.split('\n').filter((l) => l.trim()).length} baris</b>
        </div>
        <p className="dim">
          {isTugas
            ? (sim ? `Skor simulasi saat ini ${sim.skor}/100${sim.ada_error ? ', ada tabrakan pada program' : ''}.` : 'Program belum dapat dibaca; periksa sintaks G-Code.')
            : (sim ? `Program valid${sim.ada_error ? ', terdeteksi tabrakan pada pahat' : ', siap disimpan'}.` : 'Program belum dapat dibaca; periksa sintaks G-Code.')}
        </p>
      </Modal>
    </div>
  );
}
