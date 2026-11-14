// =============================================================
// CncBotWidget.jsx - Maskot AI interaktif di pojok kanan bawah.
// Memiliki animasi unik dan berbeda di setiap page, kedipan mata
// (eye blinking), gerakan super smooth, serta dialog kontekstual.
// =============================================================
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { useRoute } from '../router';
import { useSession } from '../session';
import Icon from '../ui/Icon.jsx';
import studentMascot from '../assets/cncbot-character.png';
import teacherMascot from '../assets/teacherbot-character.png';
import studentAvatar from '../assets/cncbot-avatar.jpg';

const SISWA_CHIPS = [
  'Apa beda G00 dan G01?',
  'Kenapa pahat tabrakan saat mundur?',
  'Bagaimana menentukan koordinat X diameter?',
];

const GURU_CHIPS = [
  'Buatkan draf lengkap tugas praktik bubut bertingkat',
  'Buatkan draf tugas bubut tirus & chamfer',
  'Buat 3 soal kuis pilihan ganda G02/G03 beserta kunci',
  'Rumus kecepatan potong Vc dan RPM spindel',
  'Kriteria rubrik penilaian tugas praktik bubut',
];

function getPageAnimation(path) {
  if (path.startsWith('/siswa/latihan')) return 'craft'; // Hop ceria semangat eksperimen
  if (path.startsWith('/siswa/tugas')) return 'focus'; // Angguk fokus belajar
  if (path.startsWith('/siswa/program')) return 'peek'; // Intip/tengok lemari program
  if (path.startsWith('/siswa/materi')) return 'think'; // Melayang santai memikirkan materi
  if (path.startsWith('/siswa/nilai')) return 'cheer'; // Loncat gembira rayakan nilai
  return 'wave'; // Lambaian tangan ramah di beranda
}

function getContextualGreeting(path, nama, isGuru) {
  const shortName = nama?.split(' ')[0] || (isGuru ? 'Bapak/Ibu' : 'kamu');

  if (isGuru) {
    if (path.startsWith('/guru/tugas')) {
      return `Halo Bapak/Ibu ${shortName}! Kelola penugasan praktik, kuis, dan rubrik penilaian siswa di sini. 📋`;
    }
    if (path.startsWith('/guru/kelas')) {
      return `Halo Bapak/Ibu ${shortName}! Pantau daftar siswa dan keaktifan rombel belajar Anda di sini. 👥`;
    }
    if (path.startsWith('/guru/materi') || path.startsWith('/guru/modul')) {
      return `Pustaka materi ajar & modul bubut CNC siap dibagikan ke siswa Anda. 📚`;
    }
    return `Halo Bapak/Ibu ${shortName}! 👋 CNC-TeacherBot siap mendampingi KBM bubut CNC hari ini.`;
  }

  // Siswa
  if (path.startsWith('/siswa/latihan')) {
    return `Pilih 1 modul untuk latihan atau bikin kode mu sendiri! 🚀 Bebas bereksperimen di simulator ini!`;
  }
  if (path.startsWith('/siswa/tugas')) {
    return `Halo ${shortName}! Ayo selesaikan tugas praktik dan kuis CNC kamu untuk raih skor terbaik! 📝`;
  }
  if (path.startsWith('/siswa/program')) {
    return `Ini lemari program G-Code milikmu, ${shortName}! Muat kembali program tersimpan ke simulator kapan saja. 💾`;
  }
  if (path.startsWith('/siswa/materi')) {
    return `Pelajari konsep dasar mesin bubut CNC, keselamatan kerja, hingga kode G-Code di sini! 📖`;
  }
  if (path.startsWith('/siswa/nilai')) {
    return `Pantau perkembangan belajarmu dan evaluasi hasil latihan dari guru di sini! 📊`;
  }
  // Beranda atau default
  return `Halo ${shortName}! 👋 Ada kode G-Code yang ingin dibahas atau dicoba bareng CNC-Bot hari ini?`;
}

export default function CncBotWidget() {
  const { user } = useSession();
  const currentPath = useRoute();
  const [open, setOpen] = useState(false);
  const [bubble, setBubble] = useState('');
  const [bubbleType, setBubbleType] = useState('info');
  const [dismissed, setDismissed] = useState(false);
  const [animType, setAnimType] = useState('wave');
  const [animTrigger, setAnimTrigger] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatEndRef = useRef(null);
  const prevPathRef = useRef('');
  const debounceTimerRef = useRef(0);

  const isGuru = user?.role === 'guru';
  const isSiswa = user?.role === 'siswa';

  const handleCopy = (text, index) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Event listener untuk pesan simulator interaktif (error / tabrakan / lancar aman)
  useEffect(() => {
    const handleBotBubble = (e) => {
      const { text, type, anim } = e.detail || {};
      if (!text) return;
      setBubble(text);
      setBubbleType(type || 'info');
      setDismissed(false);
      setAnimType(anim || (type === 'crash' || type === 'error' ? 'think' : type === 'success' ? 'cheer' : 'craft'));
      setAnimTrigger(true);
      setTimeout(() => setAnimTrigger(false), 2400);

      // Tambahkan ke log percakapan jika belum ada pesan kembar di paling bawah
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.text === text) return prev;
        return [...prev, { role: 'bot', text, type }];
      });
    };

    window.addEventListener('cnc:bot-bubble', handleBotBubble);
    return () => window.removeEventListener('cnc:bot-bubble', handleBotBubble);
  }, []);

  // Reaksi interaktif saat berpindah halaman: animasi unik per page & kedipan mata
  useEffect(() => {
    if (!user || (!isSiswa && !isGuru)) return;
    if (prevPathRef.current === currentPath) return;

    prevPathRef.current = currentPath;
    clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      const pageAnim = getPageAnimation(currentPath);
      setAnimType(pageAnim);
      setAnimTrigger(true);
      setTimeout(() => setAnimTrigger(false), 1800);

      const greeting = getContextualGreeting(currentPath, user.nama, isGuru);
      setBubble(greeting);
      setDismissed(false);

      setMessages((prev) => {
        if (prev.length === 0) return [{ role: 'bot', text: greeting }];
        return [...prev, { role: 'bot', text: greeting }];
      });
    }, 250);

    return () => clearTimeout(debounceTimerRef.current);
  }, [currentPath, user, isSiswa, isGuru]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const toggleChat = useCallback(() => {
    setOpen((o) => !o);
    setDismissed(true);
  }, []);

  const dismissBubble = useCallback((e) => {
    e.stopPropagation();
    setDismissed(true);
  }, []);

  const handleSendText = useCallback(async (textToSend) => {
    const text = (textToSend ?? input).trim();
    if (!text || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);
    try {
      const r = await api('/api/ai-tutor', {
        method: 'POST',
        body: JSON.stringify({ gcode: text, modul_id: null }),
      });
      const botReply = r.feedback?.join('\n\n') || (
        isGuru
          ? 'Baik Bapak/Ibu Guru, ada aspek teknis lain yang perlu kita kaji bersama?'
          : 'Hmm, CNC-Bot belum bisa menjawab itu. Coba tanyakan seputar kode G-Code atau bubut CNC!'
      );
      setMessages((prev) => [...prev, { role: 'bot', text: botReply }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'bot', text: `Maaf, terjadi kendala koneksi: ${e.message}` }]);
    }
    setLoading(false);
  }, [input, loading, isGuru]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  }, [handleSendText]);

  // Hanya tampil untuk siswa atau guru
  if (!user || (!isSiswa && !isGuru)) return null;

  const botName = isGuru ? 'Asisten Guru CNC' : 'CNC-Bot';
  const botSub = isGuru ? 'Partner KBM & Penyusun Tugas' : 'Mentor Belajar CNC';
  const mascotImg = isGuru ? teacherMascot : studentMascot;
  const chips = isGuru ? GURU_CHIPS : SISWA_CHIPS;

  return (
    <div className={`cncbot${isGuru ? ' cncbot--guru' : ''}`}>
      {/* Bubble chat sapaan & notifikasi interaktif */}
      {bubble && !dismissed && !open && (
        <div
          className={`cncbot__bubble cncbot__bubble--${bubbleType}`}
          onClick={toggleChat}
          role="button"
          tabIndex={0}
        >
          <button className="cncbot__bubble-close" onClick={dismissBubble} title="Tutup sapaan">
            <Icon name="close" size={11} />
          </button>
          <span>{bubble}</span>
        </div>
      )}

      {/* Panel chat */}
      {open && (
        <div className="cncbot__panel">
          <div className="cncbot__header">
            <img
              src={studentAvatar || mascotImg}
              alt={botName}
              className="cncbot__header-avatar"
            />
            <div>
              <b>{botName}</b>
              <span>{botSub}</span>
            </div>
            {isGuru && (
              <button
                type="button"
                className="cncbot__header-action"
                onClick={() => {
                  setOpen(false);
                  window.location.hash = '#/guru/tugas/baru';
                }}
                title="Buka formulir susun tugas baru"
              >
                <Icon name="assignment" size={13} />
                <span>Susun Tugas</span>
              </button>
            )}
            <button className="cncbot__close" onClick={toggleChat} title="Tutup chat">
              <Icon name="close" size={14} />
            </button>
          </div>

          <div className="cncbot__messages">
            {messages.map((m, i) => (
              <div key={i} className={`cncbot__msg cncbot__msg--${m.role}`}>
                {m.role === 'bot' && (
                  <img
                    src={studentAvatar || mascotImg}
                    alt="Bot"
                    className="cncbot__msg-avatar"
                  />
                )}
                <div className="cncbot__msg-wrap">
                  <div className="cncbot__msg-text">{m.text}</div>
                  {m.role === 'bot' && (
                    <button
                      type="button"
                      className="cncbot__msg-copy"
                      onClick={() => handleCopy(m.text, i)}
                      title="Salin draf ini"
                    >
                      <Icon name={copiedIndex === i ? 'check' : 'copy'} size={12} />
                      <span>{copiedIndex === i ? 'Tersalin ke clipboard!' : 'Salin draf'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="cncbot__msg cncbot__msg--bot">
                <img
                  src={studentAvatar || mascotImg}
                  alt="Bot"
                  className="cncbot__msg-avatar"
                />
                <div className="cncbot__msg-text cncbot__typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick chips saran pertanyaan */}
          <div className="cncbot__chips">
            {chips.map((c, i) => (
              <button
                key={i}
                type="button"
                className="cncbot__chip"
                onClick={() => handleSendText(c)}
                disabled={loading}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="cncbot__input-area">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isGuru
                  ? 'Tanya ide tugas, draf soal kuis, rumus pemesinan, atau analisis G-Code...'
                  : 'Ketik G-Code atau pertanyaan seputar bubut CNC...'
              }
              rows={2}
            />
            <button
              className="cncbot__send"
              onClick={() => handleSendText()}
              disabled={!input.trim() || loading}
              title="Kirim pesan"
            >
              <Icon name="send" size={16} />
            </button>
          </div>

          <div className="cncbot__footer">
            <span>
              {isGuru
                ? 'CNC-TeacherBot siap menyusun soal kuis, panduan modul praktik, dan rubrik penilaian.'
                : 'CNC-Bot membimbing dengan metode Sokratik: memberi pemantik berpikir, bukan jawaban instan.'}
            </span>
          </div>
        </div>
      )}

      {/* Tombol Maskot Mengambang dengan animasi unik per halaman & kedipan mata */}
      <button
        className={`cncbot__mascot-btn${open ? ' is-open' : ''}`}
        onClick={toggleChat}
        title={isGuru ? 'Buka Asisten Guru CNC' : 'Tanya CNC-Bot'}
        aria-label={botName}
      >
        <div className={`cncbot__character-wrap${animTrigger ? ` cncbot__character-wrap--${animType}` : ''}`}>
          <img
            src={mascotImg}
            alt={botName}
            className="cncbot__mascot-img"
          />
        </div>
        <div className="cncbot__mascot-badge">
          <span className="cncbot__dot" />
          <span>{botName}</span>
        </div>
        {open && (
          <span className="cncbot__mascot-close" title="Tutup">
            <Icon name="close" size={12} />
          </span>
        )}
      </button>
    </div>
  );
}
