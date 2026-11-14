// =============================================================
// record-smooth-demo.js - High-performance, smooth 3-4 minute walkthrough
// Uses local server with hardware GPU acceleration and background music
// =============================================================
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}/`;
const OUTPUT_DIR = path.resolve(__dirname, '../docs');
const TEMP_DIR = path.resolve(__dirname, '../.smooth_temp');
const BGM_PATH = path.resolve(__dirname, '../.bgm.ogg');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function typeSmooth(page, selector, text) {
  await page.focus(selector);
  for (const char of text) {
    await page.keyboard.type(char, { delay: 45 + Math.random() * 25 });
  }
}

async function main() {
  console.log('[SiNC High-FPS Demo] Starting local production preview server...');
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT)], {
    cwd: path.resolve(__dirname, '../lms-cnc-client'),
    stdio: 'ignore'
  });

  await sleep(2500);

  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  // Ensure ffmpeg symlink for playwright video recorder
  const ffmpegCacheDir = path.resolve(process.env.HOME, '.cache/ms-playwright/ffmpeg-1013');
  if (!fs.existsSync(ffmpegCacheDir)) {
    fs.mkdirSync(ffmpegCacheDir, { recursive: true });
  }
  const ffmpegLink = path.join(ffmpegCacheDir, 'ffmpeg-linux');
  if (!fs.existsSync(ffmpegLink) && fs.existsSync('/usr/bin/ffmpeg')) {
    try { fs.symlinkSync('/usr/bin/ffmpeg', ffmpegLink); } catch (e) {}
  }

  console.log('[SiNC High-FPS Demo] Launching Chrome with GPU Acceleration...');
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--ignore-gpu-blocklist',
      '--enable-gpu-rasterization',
      '--enable-zero-copy',
      '--window-size=1280,720'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: TEMP_DIR,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();

  try {
    // ---------------------------------------------------------
    // SCENE 1: Portal Masuk & Autentikasi Siswa (0:00 - 0:35)
    // ---------------------------------------------------------
    console.log('[Scene 1] Membuka halaman login SiNC...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await sleep(4000);

    // Scroll halus ke kartu keunggulan kurikulum vokasi
    await page.evaluate(() => window.scrollBy({ top: 190, behavior: 'smooth' }));
    await sleep(3500);
    await page.evaluate(() => window.scrollBy({ top: -190, behavior: 'smooth' }));
    await sleep(2500);

    // Ketik akun demo siswa
    console.log('[Scene 1] Mengisi akun demo siswa (andi@murid.sch.id)...');
    await typeSmooth(page, 'input[type="email"]', 'andi@murid.sch.id');
    await sleep(1500);
    await typeSmooth(page, 'input[type="password"]', 'password123');
    await sleep(2000);

    // Klik Masuk
    await page.click('button[type="submit"]');
    await sleep(5000);

    // ---------------------------------------------------------
    // SCENE 2: Beranda LMS Siswa & Modul KBM (0:35 - 1:15)
    // ---------------------------------------------------------
    console.log('[Scene 2] Menjelajah Beranda Belajar Siswa...');
    await page.evaluate(() => window.scrollBy({ top: 240, behavior: 'smooth' }));
    await sleep(4000);
    await page.evaluate(() => window.scrollBy({ top: -240, behavior: 'smooth' }));
    await sleep(3000);

    // Kunjungi Materi Ajar
    console.log('[Scene 2] Membuka pustaka Materi Ajar...');
    await page.click('a[href="#/siswa/materi"]');
    await sleep(4500);
    await page.evaluate(() => window.scrollBy({ top: 280, behavior: 'smooth' }));
    await sleep(4000);
    await page.evaluate(() => window.scrollBy({ top: -280, behavior: 'smooth' }));
    await sleep(2500);

    // Kunjungi Lemari Program G-Code
    console.log('[Scene 2] Membuka Lemari Program Mandiri...');
    await page.click('a[href="#/siswa/program"]');
    await sleep(5000);

    // Kunjungi Rekap Nilai & Rubrik
    console.log('[Scene 2] Membuka Rekapitulasi Nilai & Evaluasi...');
    await page.click('a[href="#/siswa/nilai"]');
    await sleep(5000);

    // ---------------------------------------------------------
    // SCENE 3: Simulator Mesin Bubut CNC 3D Interaktif (1:15 - 2:35)
    // ---------------------------------------------------------
    console.log('[Scene 3] Membuka Simulator Bebas...');
    await page.click('a[href="#/siswa/latihan"]');
    await sleep(6000);

    // Jalankan siklus pemotongan Program 1 (Facing + Turning)
    console.log('[Scene 3] Menjalankan siklus pemotongan 3D (Facing & Bubut Rata)...');
    const jalankanBtn = page.locator('button:has-text("Jalankan")');
    if (await jalankanBtn.count() > 0) {
      await jalankanBtn.first().click();
      console.log('[Scene 3] Pahat menyayat benda kerja dengan putaran spindel & coolant aktif...');
      await sleep(18000);
    }

    // Aktifkan mode pameran 360 derajat (inspeksi benda kerja)
    console.log('[Scene 3] Mengaktifkan mode inspeksi putar 360 derajat...');
    const pameranBtn = page.locator('button:has-text("Pameran 360")');
    if (await pameranBtn.count() > 0) {
      await pameranBtn.first().click();
      await sleep(9000);
      await pameranBtn.first().click();
      await sleep(3000);
    }

    // Ganti preset ke Level 1
    console.log('[Scene 3] Mengganti program ke Level 1 (Gerak Lurus)...');
    const selectModule = page.locator('select');
    if (await selectModule.count() > 0) {
      const options = await selectModule.first().locator('option').allTextContents();
      if (options.length > 1) {
        await selectModule.first().selectOption({ index: 1 });
        await sleep(4000);
        if (await jalankanBtn.count() > 0) {
          await jalankanBtn.first().click();
          console.log('[Scene 3] Mengeksekusi penyayatan program Level 1...');
          await sleep(16000);
        }
      }
    }

    // ---------------------------------------------------------
    // SCENE 4: Pendampingan AI CNC-Bot Tutor (2:35 - 3:10)
    // ---------------------------------------------------------
    console.log('[Scene 4] Berdialog dengan AI CNC-Bot Tutor...');
    const botBtn = page.locator('button:has-text("CNC-Bot")');
    if (await botBtn.count() > 0) {
      await botBtn.first().click();
      await sleep(4000);

      const chip = page.locator('.dialog-chip, button:has-text("G00")');
      if (await chip.count() > 0) {
        await chip.first().click();
        await sleep(8000);
      } else {
        await typeSmooth(page, 'input[type="text"]', 'Bagaimana cara mencegah tabrakan pahat saat mundur?');
        await sleep(1500);
        await page.keyboard.press('Enter');
        await sleep(7000);
      }

      const closeBot = page.locator('button[title*="Tutup" i], button:has-text("Tutup"), .dialog-close');
      if (await closeBot.count() > 0) {
        await closeBot.first().click();
        await sleep(3000);
      }
    }

    // ---------------------------------------------------------
    // SCENE 5: Simulasi Alarm Tabrakan Chuck (?demo=3d) (3:10 - 3:45)
    // ---------------------------------------------------------
    console.log('[Scene 5] Membuka Mode Demo 3D & Uji Tabrakan Pahat...');
    await page.goto(`${BASE_URL}?demo=3d`, { waitUntil: 'domcontentloaded' });
    await sleep(6000);

    const demoSelect = page.locator('select');
    if (await demoSelect.count() > 0) {
      await demoSelect.first().selectOption({ value: 'tabrakan-chuck' }).catch(async () => {
        await demoSelect.first().selectOption({ index: 3 });
      });
      await sleep(4000);

      const simRunBtn = page.locator('button:has-text("Jalankan")');
      if (await simRunBtn.count() > 0) {
        await simRunBtn.first().click();
        console.log('[Scene 5] Menjalankan simulasi hingga alarm darurat pencekam berbunyi...');
        await sleep(14000);
      }
    }

    // ---------------------------------------------------------
    // SCENE 6: Portal Guru & Manajemen Pustaka Modul (3:45 - 4:05)
    // ---------------------------------------------------------
    console.log('[Scene 6] Membuka Portal Guru Kejuruan...');
    await page.goto(`${BASE_URL}#/guru`, { waitUntil: 'domcontentloaded' });
    await sleep(4500);

    const modulLink = page.locator('a[href="#/guru/modul"]');
    if (await modulLink.count() > 0) {
      await modulLink.first().click();
      await sleep(5000);
      await page.evaluate(() => window.scrollBy({ top: 260, behavior: 'smooth' }));
      await sleep(4500);
    }

    console.log('[SiNC High-FPS Demo] Seluruh demonstrasi tuntas! Menyimpan rekaman...');
    await sleep(3000);

  } catch (err) {
    console.error('[SiNC High-FPS Demo] Error saat merekam:', err);
  } finally {
    const videoObj = page.video();
    await page.close();
    await context.close();
    await browser.close();

    // Hentikan server preview
    server.kill();

    if (videoObj) {
      const rawVideoPath = await videoObj.path();
      console.log(`[SiNC High-FPS Demo] Rekaman mentah disimpan di: ${rawVideoPath}`);

      // Dapatkan durasi video
      let duration = 200;
      try {
        const out = execSync(`ffprobe -i "${rawVideoPath}" -show_entries format=duration -v quiet -of csv="p=0"`).toString().trim();
        duration = parseFloat(out) || 200;
        console.log(`[SiNC High-FPS Demo] Durasi video: ${duration.toFixed(1)} detik`);
      } catch (e) {}

      const mp4Output = path.join(OUTPUT_DIR, 'demo-sinc.mp4');
      const fadeOutStart = Math.max(0, duration - 4).toFixed(1);

      console.log(`[SiNC High-FPS Demo] Menggabungkan audio no-copyright & ekspor MP4 halus...`);
      const cmd = `ffmpeg -y -i "${rawVideoPath}" -i "${BGM_PATH}" -filter_complex "[1:a]volume=0.28,afade=t=in:ss=0:d=2.5,afade=t=out:st=${fadeOutStart}:d=3.5[a]" -map 0:v -map "[a]" -c:v libopenh264 -b:v 1400k -c:a aac -b:a 128k -shortest "${mp4Output}"`;

      try {
        execSync(cmd, { stdio: 'inherit' });
        console.log(`[SiNC High-FPS Demo] Berhasil! Video disimpan di docs/demo-sinc.mp4`);
      } catch (e) {
        console.error(`[SiNC High-FPS Demo] Gagal transcode audio mix:`, e.message);
        execSync(`ffmpeg -y -i "${rawVideoPath}" -c:v libopenh264 -b:v 1400k -an "${mp4Output}"`, { stdio: 'inherit' });
      }

      // Generate updated crisp animated GIF
      console.log(`[SiNC High-FPS Demo] Membuat animasi cuplikan baru docs/demo-preview.gif...`);
      try {
        const gifCmd = `ffmpeg -y -ss 00:01:25 -t 7 -i "${mp4Output}" -vf "fps=14,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" "${path.join(OUTPUT_DIR, 'demo-preview.gif')}"`;
        execSync(gifCmd, { stdio: 'inherit' });
        console.log(`[SiNC High-FPS Demo] Cuplikan GIF berhasil dibuat!`);
      } catch (e) {
        console.error(`[SiNC High-FPS Demo] Gagal buat GIF:`, e.message);
      }

      // Bersihkan folder temp
      try {
        fs.rmSync(TEMP_DIR, { recursive: true, force: true });
      } catch (e) {}
    }
  }
}

main().then(() => {
  console.log('[SiNC High-FPS Demo] Selesai.');
  process.exit(0);
}).catch((err) => {
  console.error('[SiNC High-FPS Demo] Fatal:', err);
  process.exit(1);
});
