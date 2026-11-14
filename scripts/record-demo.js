// =============================================================
// record-demo.js - Automated walkthrough & video demo recorder for SiNC
// Records a 3-4 minute walkthrough showcasing SiNC features
// =============================================================
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const BASE_URL = process.env.DEMO_URL || 'https://fatafavian.github.io/SiNC/';
const OUTPUT_DIR = path.resolve(__dirname, '../docs');
const TEMP_VIDEO_DIR = path.resolve(__dirname, '../.video_temp');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function typeRealistic(page, selector, text) {
  await page.focus(selector);
  for (const char of text) {
    await page.keyboard.type(char, { delay: 40 + Math.random() * 30 });
  }
}

async function runDemo() {
  console.log(`[SiNC Demo] Starting comprehensive automated walkthrough on: ${BASE_URL}`);

  if (!fs.existsSync(TEMP_VIDEO_DIR)) {
    fs.mkdirSync(TEMP_VIDEO_DIR, { recursive: true });
  }

  // Ensure ffmpeg symlink for playwright if needed
  const ffmpegCacheDir = path.resolve(process.env.HOME, '.cache/ms-playwright/ffmpeg-1013');
  if (!fs.existsSync(ffmpegCacheDir)) {
    fs.mkdirSync(ffmpegCacheDir, { recursive: true });
  }
  const ffmpegLink = path.join(ffmpegCacheDir, 'ffmpeg-linux');
  if (!fs.existsSync(ffmpegLink) && fs.existsSync('/usr/bin/ffmpeg')) {
    try { fs.symlinkSync('/usr/bin/ffmpeg', ffmpegLink); } catch (e) {}
  }

  const launchOptions = {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--window-size=1280,720'
    ]
  };
  if (process.env.CHROME_BIN) {
    launchOptions.executablePath = process.env.CHROME_BIN;
  } else if (fs.existsSync('/usr/bin/google-chrome')) {
    launchOptions.executablePath = '/usr/bin/google-chrome';
  }

  const browser = await chromium.launch(launchOptions);

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: TEMP_VIDEO_DIR,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();

  try {
    // -------------------------------------------------------------
    // SCENE 1: Portal & Student Authentication (0:00 - 0:30)
    // -------------------------------------------------------------
    console.log('[Scene 1] Navigating to SiNC Landing & Login Page...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await sleep(4000);

    // Scroll through value cards
    await page.evaluate(() => window.scrollBy({ top: 200, behavior: 'smooth' }));
    await sleep(3500);
    await page.evaluate(() => window.scrollBy({ top: -200, behavior: 'smooth' }));
    await sleep(2500);

    // Enter Student Demo Credentials (andi@murid.sch.id)
    console.log('[Scene 1] Entering Student demo credentials...');
    await typeRealistic(page, 'input[type="email"]', 'andi@murid.sch.id');
    await sleep(1500);
    await typeRealistic(page, 'input[type="password"]', 'password123');
    await sleep(2000);

    // Click Masuk
    await page.click('button[type="submit"]');
    await sleep(5000);

    // -------------------------------------------------------------
    // SCENE 2: Student LMS Dashboard & Academic Content (0:30 - 1:05)
    // -------------------------------------------------------------
    console.log('[Scene 2] Reviewing Student Academic Dashboard...');
    await page.evaluate(() => window.scrollBy({ top: 220, behavior: 'smooth' }));
    await sleep(4000);
    await page.evaluate(() => window.scrollBy({ top: -220, behavior: 'smooth' }));
    await sleep(3000);

    // Navigate to Materi Ajar
    console.log('[Scene 2] Inspecting Materi Ajar modules...');
    await page.click('a[href="#/siswa/materi"]');
    await sleep(4000);
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await sleep(4500);
    await page.evaluate(() => window.scrollBy({ top: -300, behavior: 'smooth' }));
    await sleep(2500);

    // Navigate to Program Saya (Cloud G-Code Storage)
    console.log('[Scene 2] Inspecting Program Saya storage locker...');
    await page.click('a[href="#/siswa/program"]');
    await sleep(5000);

    // Navigate to Nilai Saya (Grades and Rubrics)
    console.log('[Scene 2] Checking Nilai Saya & Automated Scoring history...');
    await page.click('a[href="#/siswa/nilai"]');
    await sleep(5000);

    // -------------------------------------------------------------
    // SCENE 3: Simulator Bebas - 2D G-Code & 3D Turning (1:05 - 2:25)
    // -------------------------------------------------------------
    console.log('[Scene 3] Opening Simulator Bebas...');
    await page.click('a[href="#/siswa/latihan"]');
    await sleep(6000);

    // Run first cutting simulation (Facing + Turning)
    console.log('[Scene 3] Running Facing + Longitudinal Turning simulation...');
    const jalankanBtn = page.locator('button:has-text("Jalankan")');
    if (await jalankanBtn.count() > 0) {
      await jalankanBtn.first().click();
      console.log('[Scene 3] Machining in progress: tool movement and real-time stock removal...');
      await sleep(15000);
    }

    // Toggle 360 Turntable View
    console.log('[Scene 3] Enabling 360 Turntable Inspection...');
    const pameranBtn = page.locator('button:has-text("Pameran 360")');
    if (await pameranBtn.count() > 0) {
      await pameranBtn.first().click();
      await sleep(8000);
      await pameranBtn.first().click();
      await sleep(3000);
    }

    // Switch to Level 1 / Level 2 Curriculum Preset
    console.log('[Scene 3] Switching to Level 1 Curriculum Preset...');
    const selectModule = page.locator('select');
    if (await selectModule.count() > 0) {
      const options = await selectModule.first().locator('option').allTextContents();
      if (options.length > 1) {
        await selectModule.first().selectOption({ index: 1 });
        await sleep(4000);
        if (await jalankanBtn.count() > 0) {
          await jalankanBtn.first().click();
          console.log('[Scene 3] Executing Level 1 program cut...');
          await sleep(14000);
        }
      }
    }

    // -------------------------------------------------------------
    // SCENE 4: AI CNC-Bot Tutor Pedagogical Consultation (2:25 - 3:00)
    // -------------------------------------------------------------
    console.log('[Scene 4] Consulting AI CNC-Bot Tutor...');
    const botBtn = page.locator('button:has-text("CNC-Bot")');
    if (await botBtn.count() > 0) {
      await botBtn.first().click();
      await sleep(4000);

      const chip = page.locator('.dialog-chip, button:has-text("G00")');
      if (await chip.count() > 0) {
        await chip.first().click();
        await sleep(6000);
      } else {
        await typeRealistic(page, 'input[type="text"]', 'Bagaimana cara mencegah pahat tabrakan?');
        await sleep(1500);
        await page.keyboard.press('Enter');
        await sleep(6000);
      }

      // Close bot dialog
      const closeBot = page.locator('button[title*="Tutup" i], button:has-text("Tutup"), .dialog-close');
      if (await closeBot.count() > 0) {
        await closeBot.first().click();
        await sleep(3000);
      }
    }

    // -------------------------------------------------------------
    // SCENE 5: Standalone 3D Demo & Chuck Crash Safety Alarm (3:00 - 3:35)
    // -------------------------------------------------------------
    console.log('[Scene 5] Navigating to Standalone 3D Simulator (?demo=3d)...');
    await page.goto(`${BASE_URL}?demo=3d`, { waitUntil: 'domcontentloaded' });
    await sleep(6000);

    // Demonstrate Chuck Crash Alarm
    console.log('[Scene 5] Demonstrating Chuck Crash Alarm Protection...');
    const demoSelect = page.locator('select');
    if (await demoSelect.count() > 0) {
      await demoSelect.first().selectOption({ value: 'tabrakan-chuck' }).catch(async () => {
        await demoSelect.first().selectOption({ index: 3 });
      });
      await sleep(4000);

      const simRunBtn = page.locator('button:has-text("Jalankan")');
      if (await simRunBtn.count() > 0) {
        await simRunBtn.first().click();
        console.log('[Scene 5] Running crash simulation until safety alarm engages...');
        await sleep(12000);
      }
    }

    // -------------------------------------------------------------
    // SCENE 6: Teacher Management & Curriculum Library (3:35 - 3:55)
    // -------------------------------------------------------------
    console.log('[Scene 6] Exploring Teacher Portal & Curriculum Library...');
    await page.goto(`${BASE_URL}#/guru`, { waitUntil: 'domcontentloaded' });
    await sleep(4000);

    // Visit Pustaka Modul
    const modulLink = page.locator('a[href="#/guru/modul"]');
    if (await modulLink.count() > 0) {
      await modulLink.first().click();
      await sleep(5000);
      await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
      await sleep(4000);
    }

    console.log('[SiNC Demo] Comprehensive walkthrough completed successfully!');
    await sleep(3000);

  } catch (err) {
    console.error('[SiNC Demo] Error during walkthrough:', err);
  } finally {
    const videoObj = page.video();
    await page.close();
    await context.close();
    await browser.close();

    if (videoObj) {
      const rawVideoPath = await videoObj.path();
      console.log(`[SiNC Demo] Raw video recorded at: ${rawVideoPath}`);

      const mp4Output = path.join(OUTPUT_DIR, 'demo-sinc.mp4');
      console.log(`[SiNC Demo] Transcoding to high compatibility MP4: ${mp4Output}`);

      // Try libopenh264 first, fallback to libx264, then copy
      let transcoded = false;
      const encoders = ['libopenh264 -b:v 1100k', 'libx264 -crf 26 -preset slow', 'mpeg4 -b:v 1500k'];

      for (const enc of encoders) {
        try {
          execSync(`ffmpeg -y -i "${rawVideoPath}" -c:v ${enc} -pix_fmt yuv420p -an "${mp4Output}"`, {
            stdio: 'inherit'
          });
          console.log(`[SiNC Demo] Transcoded successfully with: ${enc}`);
          transcoded = true;
          break;
        } catch (e) {
          console.log(`[SiNC Demo] Failed with encoder ${enc}: ${e.message}`);
        }
      }

      if (!transcoded) {
        fs.copyFileSync(rawVideoPath, path.join(OUTPUT_DIR, 'demo-sinc.webm'));
        console.log('[SiNC Demo] Saved raw webm to docs/demo-sinc.webm');
      }

      // Cleanup temp
      try {
        fs.rmSync(TEMP_VIDEO_DIR, { recursive: true, force: true });
      } catch (e) {}
    }
  }
}

runDemo().then(() => {
  console.log('[SiNC Demo] Recording finished.');
  process.exit(0);
}).catch(err => {
  console.error('[SiNC Demo] Fatal error:', err);
  process.exit(1);
});
