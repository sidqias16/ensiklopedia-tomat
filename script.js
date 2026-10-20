/* ============================================================
   TOMAT LANDING PAGE - script.js
   Features: Dark/Light mode, Kalkulator Panen, Tab Perawatan,
             Checklist Interaktif, Scroll Progress, Reveal Animations
   ============================================================ */

'use strict';

/* ============================================================
   1. THEME TOGGLE (Dark / Light Mode)
   ============================================================ */
const THEME_KEY = 'tomatpedia-theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn  = document.getElementById('theme-toggle-btn');
  const label = document.getElementById('theme-label-text');
  if (btn) {
    btn.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
  }
  if (label) {
    label.textContent = theme === 'dark' ? '🌙Gelap' : '☀️Terang';
  }
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (prefersDark ? 'dark' : 'light');
  applyTheme(initial);
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    });
  }
});

/* ============================================================
   2. SCROLL PROGRESS BAR
   ============================================================ */
function updateScrollProgress() {
  const el   = document.getElementById('scroll-progress');
  if (!el) return;
  const scrollTop  = document.documentElement.scrollTop || document.body.scrollTop;
  const docHeight  = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const progress   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  el.style.width   = `${progress.toFixed(2)}%`;
}

/* ============================================================
   3. NAVBAR SCROLL EFFECT & ACTIVE NAV LINK
   ============================================================ */
function updateNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

function initActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop().toLowerCase() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPath = href.split('/').pop().toLowerCase();
    if (linkPath === currentPath || ((currentPath === '' || currentPath === '/') && linkPath === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* ============================================================
   4. SCROLL REVEAL ANIMATIONS
   ============================================================ */
function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger delay for sibling elements
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach(el => observer.observe(el));
}

/* ============================================================
   5. HAMBURGER MOBILE NAV
   ============================================================ */
let mobileNavOpen = false;

function closeMobileNav() {
  const nav = document.getElementById('mobile-nav');
  const btn = document.getElementById('hamburger-btn');
  if (nav) nav.style.display = 'none';
  if (btn) btn.setAttribute('aria-expanded', 'false');
  mobileNavOpen = false;
}

function initHamburger() {
  const btn = document.getElementById('hamburger-btn');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    mobileNavOpen = !mobileNavOpen;
    nav.style.display = mobileNavOpen ? 'block' : 'none';
    btn.setAttribute('aria-expanded', mobileNavOpen ? 'true' : 'false');
  });
}

/* ============================================================
   6. KALKULATOR PANEN
   ============================================================ */
const VARIETAS_DATA = {
  cherry:        { panen: 55, bunga: 30, name: 'Tomat Ceri',       tip: 'Tomat Ceri sangat produktif! Panen dilakukan bertahap karena buah matang tidak bersamaan. Gunakan gunting kecil untuk memetik tangkai kecil.' },
  apel:          { panen: 80, bunga: 45, name: 'Tomat Apel',       tip: 'Tomat Apel membutuhkan ajir yang kuat karena buahnya berat. Pangkas menjadi 1–2 batang utama untuk buah yang lebih besar dan berkualitas.' },
  gondol:        { panen: 75, bunga: 40, name: 'Tomat Gondol',     tip: 'Tomat Gondol sangat tahan lama pasca panen. Ideal untuk petani komersial. Pastikan panen saat 75% buah sudah berwarna merah-oranye.' },
  mawar:         { panen: 90, bunga: 50, name: 'Tomat Mawar',      tip: 'Tomat Mawar adalah varietas premium dengan harga jual tinggi. Membutuhkan perawatan intensif terutama pemupukan kalium untuk warna dan rasa optimal.' },
  'cherry-yellow': { panen: 60, bunga: 32, name: 'Tomat Ceri Kuning', tip: 'Tomat Ceri Kuning kaya akan beta-karoten. Rasanya lebih manis dari tomat ceri merah. Sangat dekoratif dan laris di pasar organik.' },
};

function formatDate(date) {
  return date.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function hitungPanen() {
  const tanggalInput  = document.getElementById('tanggal-semai');
  const varietasInput = document.getElementById('varietas-tomat');
  const resultDiv     = document.getElementById('kalkulator-result');

  if (!tanggalInput || !varietasInput || !resultDiv) return;

  const tanggalVal  = tanggalInput.value;
  const varietasVal = varietasInput.value;

  // Validation
  if (!tanggalVal) {
    showKalkulatorError('Silakan masukkan tanggal semai terlebih dahulu. 📅');
    return;
  }
  if (!varietasVal) {
    showKalkulatorError('Silakan pilih varietas tomat terlebih dahulu. 🍅');
    return;
  }

  const semai   = new Date(tanggalVal);
  const data    = VARIETAS_DATA[varietasVal];
  const pindah  = addDays(semai, 14);
  const bunga   = addDays(semai, data.bunga);
  const panen   = addDays(semai, data.panen);

  // Hitung fase saat ini
  const today      = new Date();
  const daysDiff   = Math.floor((today - semai) / (1000 * 60 * 60 * 24));
  let currentTip   = '';

  if (daysDiff < 0) {
    currentTip = `📅 Rencana semai dimulai dalam <strong>${Math.abs(daysDiff)} hari</strong>. Siapkan benih berkualitas, media semai steril, dan tempat yang cukup cahaya!`;
  } else if (daysDiff < 7) {
    currentTip = `🌱 <strong>Fase Perkecambahan (Hari ${daysDiff}):</strong> Jaga kelembapan media semai, jangan sampai kering. Letakkan di tempat terang namun terhindar dari hujan langsung. Benih biasanya berkecambah dalam 5–7 hari.`;
  } else if (daysDiff < 14) {
    currentTip = `🌿 <strong>Fase Bibit Muda (Hari ${daysDiff}):</strong> Bibit sudah berkecambah! Pastikan mendapat sinar matahari cukup agar tidak etiolasi. Siap pindah tanam dalam ${14 - daysDiff} hari.`;
  } else if (daysDiff < data.bunga) {
    currentTip = `💪 <strong>Fase Vegetatif (Hari ${daysDiff}):</strong> Tanaman sedang tumbuh aktif. Berikan pupuk nitrogen, pasang ajir, dan mulai pangkas tunas air. Bunga pertama diperkirakan dalam ${data.bunga - daysDiff} hari.`;
  } else if (daysDiff < data.panen) {
    currentTip = `🌼 <strong>Fase Generatif (Hari ${daysDiff}):</strong> Tanaman sudah/sedang berbunga! Beralih ke pupuk P dan K tinggi. Bantu penyerbukan dengan menggoyangkan batang setiap pagi. Panen pertama diperkirakan dalam ${data.panen - daysDiff} hari.`;
  } else {
    currentTip = `🍅 <strong>Panen Sudah Tiba!</strong> Tomat ${data.name} Anda seharusnya sudah bisa dipanen. Periksa buah yang sudah 80–90% merah dan terasa sedikit lunak. Selamat panen! 🎉`;
  }

  document.getElementById('result-pindah').textContent = formatDate(pindah);
  document.getElementById('result-bunga').textContent  = formatDate(bunga);
  document.getElementById('result-panen').textContent  = formatDate(panen);
  document.getElementById('result-tip').innerHTML      = currentTip + `<br><br>💡 <em>Tips ${data.name}: ${data.tip}</em>`;

  resultDiv.classList.add('show');
  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showKalkulatorError(msg) {
  const resultDiv = document.getElementById('kalkulator-result');
  const tipEl     = document.getElementById('result-tip');
  if (!resultDiv || !tipEl) return;

  document.getElementById('result-pindah').textContent = '—';
  document.getElementById('result-bunga').textContent  = '—';
  document.getElementById('result-panen').textContent  = '—';
  tipEl.innerHTML = `⚠️ ${msg}`;
  resultDiv.classList.add('show');
}

/* ============================================================
   6B. KALKULATOR GIZI TOMAT INTERAKTIF
   ============================================================ */
const GIZI_DATABASE = {
  'tomat-merah': {
    name: 'Tomat Merah Segar (Mentah)',
    kalori: 18,
    air: 94.5,
    protein: 0.88,
    lemak: 0.20,
    karbo: 3.89,
    serat: 1.20,
    gula: 2.63,
    likopen: 2573, // in µg
    likopenBio: 'Sedang (Bentuk Trans)',
    vitC: 13.7,    // in mg
    vitA: 42,      // in µg RAE
    kalium: 237,   // in mg
    vitK: 7.9,     // in µg
    kalsium: 10,   // in mg
    besi: 0.27,    // in mg
    folat: 15,     // in µg
    tip: 'Tomat merah mentah mempertahankan 100% kandungan Vitamin C alami yang rentan rusak oleh suhu panas. Sangat cocok untuk irisan salad, sandwich, atau jus segar dingin.'
  },
  'tomat-ceri': {
    name: 'Tomat Ceri Segar (Cherry)',
    kalori: 27,
    air: 91.0,
    protein: 1.30,
    lemak: 0.20,
    karbo: 5.80,
    serat: 1.80,
    gula: 4.40,
    likopen: 3100,
    likopenBio: 'Sedang',
    vitC: 26.0,
    vitA: 54,
    kalium: 296,
    vitK: 10.1,
    kalsium: 14,
    besi: 0.45,
    folat: 20,
    tip: 'Tomat ceri memiliki konsentrasi gula alami fruktosa lebih tinggi dan Vitamin C hampir 2x lipat tomat biasa per 100 gram. Camilan sehat padat mikronutrien yang manis menyegarkan!'
  },
  'tomat-masak': {
    name: 'Tomat Masak / Rebus / Panggang',
    kalori: 22,
    air: 93.8,
    protein: 1.00,
    lemak: 0.25,
    karbo: 4.60,
    serat: 1.40,
    gula: 3.10,
    likopen: 3950,
    likopenBio: 'Sangat Tinggi (Cis-Isomer Aktif)',
    vitC: 9.8,
    vitA: 48,
    kalium: 250,
    vitK: 8.5,
    kalsium: 12,
    besi: 0.35,
    folat: 13,
    tip: 'Proses pemanasan memecah dinding sel selulosa tanaman dan mengubah isomer likopen menjadi cis-likopen yang 300%–1000% lebih gampang diserap tubuh dibandingkan tomat mentah. Tambahkan sedikit minyak zaitun untuk hasil maksimal!'
  },
  'pasta-tomat': {
    name: 'Pasta / Purée Tomat Kental',
    kalori: 82,
    air: 73.5,
    protein: 4.30,
    lemak: 0.45,
    karbo: 18.9,
    serat: 4.10,
    gula: 10.2,
    likopen: 28760,
    likopenBio: 'Maksimal (Ultra Bioavailable)',
    vitC: 21.9,
    vitA: 76,
    kalium: 1014,
    vitK: 14.5,
    kalsium: 36,
    besi: 2.98,
    folat: 24,
    tip: 'Konsentrasi antioksidan likopen dan elektrolit kalium tertinggi! Cukup 1–2 sendok makan pasta tomat murni sudah melampaui target harian likopen pencegah penyakit kardiovaskular.'
  },
  'jus-tomat': {
    name: 'Jus Tomat Murni (100% Segar)',
    kalori: 17,
    air: 94.2,
    protein: 0.85,
    lemak: 0.10,
    karbo: 4.20,
    serat: 0.40,
    gula: 2.60,
    likopen: 9030,
    likopenBio: 'Tinggi (Sel Tereduksi)',
    vitC: 18.3,
    vitA: 46,
    kalium: 217,
    vitK: 2.3,
    kalsium: 9,
    besi: 0.30,
    folat: 18,
    tip: 'Pilihan hidrasi pemulihan seluler terbaik pasca olahraga. Kandungan kalium alami mengembalikan keseimbangan elektrolit tanpa gula buatan maupun sodium berlebih.'
  },
  'tomat-kering': {
    name: 'Tomat Kering (Sun-Dried)',
    kalori: 258,
    air: 14.6,
    protein: 14.1,
    lemak: 2.97,
    karbo: 55.8,
    serat: 12.3,
    gula: 37.6,
    likopen: 45900,
    likopenBio: 'Tinggi',
    vitC: 39.2,
    vitA: 64,
    kalium: 3427,
    vitK: 43.0,
    kalsium: 110,
    besi: 9.09,
    folat: 68,
    tip: 'Kandungan nutrisi terkonsentrasi sangat tinggi dengan cita rasa gurih umami mendalam. Sangat kaya zat besi, kalsium, dan serat pangan untuk campuran pasta atau tumisan.'
  }
};

// Standar Kebutuhan Gizi Harian Dewasa (AKG Kemenkes / FDA basis 2000 kkal)
const AKG_STANDAR = {
  kalori: 2000, // kkal
  vitC: 90,     // mg
  likopen: 10000, // 10 mg (10000 µg target harian klinis)
  kalium: 3500, // mg
  serat: 30,    // g
  vitA: 900,    // µg RAE
  vitK: 120,    // µg
  kalsium: 1000,// mg
  besi: 18,     // mg
  folat: 400    // µg
};

let lastCalculatedNutrition = null;

function hitungGizi() {
  const tipeSelect  = document.getElementById('gizi-tipe');
  const beratInput  = document.getElementById('gizi-berat');
  const sliderInput = document.getElementById('gizi-slider');
  const fokusSelect = document.getElementById('gizi-fokus');

  if (!tipeSelect || !beratInput) return;

  const tipeKey = tipeSelect.value || 'tomat-merah';
  let beratGram = parseFloat(beratInput.value);

  if (isNaN(beratGram) || beratGram < 10) beratGram = 10;
  if (beratGram > 1000) beratGram = 1000;

  // Sync inputs
  beratInput.value = beratGram;
  if (sliderInput && sliderInput.value != beratGram) {
    sliderInput.value = beratGram;
  }

  const data = GIZI_DATABASE[tipeKey] || GIZI_DATABASE['tomat-merah'];
  const ratio = beratGram / 100;

  // Calculatings
  const kalori     = Math.round(data.kalori * ratio);
  const air        = (data.air * ratio).toFixed(1);
  const protein    = (data.protein * ratio).toFixed(2);
  const lemak      = (data.lemak * ratio).toFixed(2);
  const karbo      = (data.karbo * ratio).toFixed(2);
  const serat      = (data.serat * ratio).toFixed(2);
  const gula       = (data.gula * ratio).toFixed(2);

  const likopenUg  = Math.round(data.likopen * ratio);
  const likopenMg  = (likopenUg / 1000).toFixed(2);

  const vitC       = (data.vitC * ratio).toFixed(1);
  const vitA       = Math.round(data.vitA * ratio);
  const kalium     = Math.round(data.kalium * ratio);
  const vitK       = (data.vitK * ratio).toFixed(1);
  const kalsium    = Math.round(data.kalsium * ratio);
  const besi       = (data.besi * ratio).toFixed(2);
  const folat      = Math.round(data.folat * ratio);

  // % AKG
  const akgKalori  = ((kalori / AKG_STANDAR.kalori) * 100).toFixed(1);
  const akgVitC    = Math.round((parseFloat(vitC) / AKG_STANDAR.vitC) * 100);
  const akgLikopen = Math.round((likopenUg / AKG_STANDAR.likopen) * 100);
  const akgKalium  = Math.round((kalium / AKG_STANDAR.kalium) * 100);
  const akgSerat   = Math.round((parseFloat(serat) / AKG_STANDAR.serat) * 100);
  const akgVitA    = Math.round((vitA / AKG_STANDAR.vitA) * 100);
  const akgVitK    = Math.round((parseFloat(vitK) / AKG_STANDAR.vitK) * 100);
  const akgKalsium = Math.round((kalsium / AKG_STANDAR.kalsium) * 100);
  const akgBesi    = Math.round((parseFloat(besi) / AKG_STANDAR.besi) * 100);
  const akgFolat   = Math.round((folat / AKG_STANDAR.folat) * 100);

  // Store for clipboard copy
  lastCalculatedNutrition = {
    tipeName: data.name,
    beratGram,
    kalori, akgKalori,
    likopenMg, likopenUg, akgLikopen, likopenBio: data.likopenBio,
    vitC, akgVitC,
    kalium, akgKalium,
    air, karbo, gula, serat, akgSerat,
    protein, lemak,
    vitA, akgVitA, vitK, akgVitK, kalsium, akgKalsium, besi, akgBesi, folat, akgFolat,
    tip: data.tip
  };

  // Update KPI Cards
  setElText('res-kalori-val', kalori);
  setElText('res-kalori-tag', `${akgKalori}% AKG (2000 kkal)`);

  setElText('res-likopen-val', likopenMg);
  setElText('res-likopen-tag', data.likopenBio);

  setElText('res-vitc-val', vitC);
  setElText('res-vitc-tag', `${akgVitC}% Kebutuhan Harian`);

  setElText('res-kalium-val', kalium);
  setElText('res-kalium-tag', `${akgKalium}% AKG`);

  // Update Makronutrien Table
  setElText('tbl-air', `${air} g (${((parseFloat(air)/beratGram)*100).toFixed(0)}%)`);
  setElText('tbl-karbo', `${karbo} g`);
  setElText('tbl-gula', `${gula} g`);
  setElText('tbl-serat', `${serat} g`);
  setElText('tbl-serat-akg', `${akgSerat}% AKG`);
  setElText('tbl-protein', `${protein} g`);
  setElText('tbl-lemak', `${lemak} g`);

  // Update Mikronutrien Table
  setElText('tbl-vitc', `${vitC} mg`);
  setElText('tbl-vitc-akg', `${akgVitC}% AKG`);

  setElText('tbl-likopen', `${likopenMg} mg (${likopenUg.toLocaleString('id-ID')} µg)`);

  setElText('tbl-vita', `${vitA} µg`);
  setElText('tbl-vita-akg', `${akgVitA}% AKG`);

  setElText('tbl-kalium', `${kalium} mg`);
  setElText('tbl-kalium-akg', `${akgKalium}% AKG`);

  setElText('tbl-vitk', `${vitK} µg`);
  setElText('tbl-vitk-akg', `${akgVitK}% AKG`);

  setElText('tbl-kalsium', `${kalsium} mg`);
  setElText('tbl-kalsium-akg', `${akgKalsium}% AKG`);

  setElText('tbl-besi', `${besi} mg`);
  setElText('tbl-besi-akg', `${akgBesi}% AKG`);

  setElText('tbl-folat', `${folat} µg`);
  setElText('tbl-folat-akg', `${akgFolat}% AKG`);

  // Update Progress Bars
  updateAkgBar('bar-akg-vitc', akgVitC);
  updateAkgBar('bar-akg-likopen', akgLikopen);
  updateAkgBar('bar-akg-kalium', akgKalium);
  updateAkgBar('bar-akg-serat', akgSerat);
  updateAkgBar('bar-akg-vita', akgVitA);
  updateAkgBar('bar-akg-vitk', akgVitK);

  // Update Smart Insights
  const fokus = fokusSelect ? fokusSelect.value : 'seimbang';
  let insightTitle = 'Analisis Nutrisi Terpadu';
  let insightText = '';

  if (fokus === 'jantung') {
    insightTitle = '❤️ Fokus Kesehatan Jantung & Pembuluh Darah';
    insightText = `Porsi <strong>${beratGram}g ${data.name}</strong> menyuplai <strong>${likopenMg} mg likopen</strong> dan <strong>${kalium} mg kalium (${akgKalium}% AKG)</strong>. Kalium bekerja efektif menetralkan kelebihan natrium untuk menjaga elastisitas dinding arteri dan tekanan darah normal, sementara likopen mencegah oksidasi kolesterol LDL pemicu plak jantung.`;
  } else if (fokus === 'diet') {
    insightTitle = '⚖️ Fokus Diet & Kontrol Berat Badan';
    insightText = `Sangat ideal untuk defisit kalori! Porsi <strong>${beratGram}g</strong> hanya menyumbang <strong>${kalori} kkal (${akgKalori}% dari 2000 kkal)</strong>, namun memberikan <strong>${air} ml air murni</strong> dan <strong>${serat}g serat pangan</strong>. Ini menciptakan rasa kenyang lambung yang bertahan lama (diet volumetrics) tanpa memicu lonjakan gula darah mendadak.`;
  } else if (fokus === 'kulit') {
    insightTitle = '✨ Fokus Kesehatan Kulit & Anti-Aging';
    insightText = `Porsi ini memenuhi <strong>${akgVitC}% kebutuhan harian Vitamin C</strong> yang merupakan kofaktor wajib dalam sintesis serat kolagen kulit alami. Bersama <strong>${likopenMg} mg likopen</strong> dan <strong>${vitA} µg Vitamin A</strong>, sel kulit Anda memiliki perisai antioksidan internal dari paparan sinar radiasi matahari UV dan polusi radikal bebas.`;
  } else {
    insightTitle = '🥗 Fokus Keseimbangan Nutrisi Sehat Harian';
    insightText = `Kombinasi superfood yang prima! Dengan mengonsumsi <strong>${beratGram}g ${data.name}</strong>, Anda telah mencukupi <strong>${akgVitC}% target Vitamin C</strong>, <strong>${akgLikopen}% target likopen klinis</strong>, serta <strong>${akgKalium}% kalium harian</strong> dengan hanya <strong>${kalori} kkal</strong> energi.`;
  }

  insightText += `<br><br>💡 <strong>Tips Kuliner:</strong> ${data.tip}`;

  setElHtml('gizi-insight-title', insightTitle);
  setElHtml('gizi-insight-text', insightText);
}

function setElText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setElHtml(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function updateAkgBar(id, percent) {
  const bar = document.getElementById(id);
  const text = document.getElementById(`${id}-val`);
  if (!bar) return;
  const clamped = Math.min(Math.max(percent, 0), 100);
  bar.style.width = `${clamped}%`;
  if (text) text.textContent = `${percent}% AKG`;
}

function setGiziPreset(grams, btn) {
  const beratInput  = document.getElementById('gizi-berat');
  const sliderInput = document.getElementById('gizi-slider');
  if (beratInput)  beratInput.value = grams;
  if (sliderInput) sliderInput.value = grams;

  // Active state on buttons
  document.querySelectorAll('.gizi-preset-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  hitungGizi();
}

function resetGizi() {
  const tipeSelect  = document.getElementById('gizi-tipe');
  const fokusSelect = document.getElementById('gizi-fokus');
  if (tipeSelect)  tipeSelect.value = 'tomat-merah';
  if (fokusSelect) fokusSelect.value = 'seimbang';
  setGiziPreset(100, document.querySelector('.gizi-preset-btn'));
}

function salinRingkasanGizi() {
  if (!lastCalculatedNutrition) hitungGizi();
  const d = lastCalculatedNutrition;
  if (!d) return;

  const summary = `🍅 Ringkasan Nilai Gizi Tomat — TomatPedia
Varian: ${d.tipeName}
Porsi: ${d.beratGram} gram

🔥 Kalori Total: ${d.kalori} kkal (${d.akgKalori}% AKG)
🔴 Likopen: ${d.likopenMg} mg (${d.akgLikopen}% Target - ${d.likopenBio})
🍊 Vitamin C: ${d.vitC} mg (${d.akgVitC}% AKG)
🍋 Kalium: ${d.kalium} mg (${d.akgKalium}% AKG)
💧 Kadar Air: ${d.air} g
🌾 Serat Pangan: ${d.serat} g (${d.akgSerat}% AKG)
🍞 Karbohidrat: ${d.karbo} g (Gula Alami: ${d.gula} g)
🥩 Protein Nabati: ${d.protein} g | 🧈 Lemak: ${d.lemak} g
🟡 Vitamin A: ${d.vitA} µg | 🌿 Vitamin K: ${d.vitK} µg

💡 Tips: ${d.tip}
Dihitung otomatis di: https://tomatpedia.id/manfaat.html#kalkulator-gizi`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(summary).then(() => {
      showGiziToast('📋 Ringkasan gizi berhasil disalin ke clipboard!');
    }).catch(() => {
      fallbackCopy(summary);
    });
  } else {
    fallbackCopy(summary);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showGiziToast('📋 Ringkasan gizi berhasil disalin ke clipboard!');
  } catch (err) {
    showGiziToast('⚠️ Gagal menyalin secara otomatis');
  }
  document.body.removeChild(ta);
}

function showGiziToast(message) {
  let toast = document.getElementById('gizi-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'gizi-toast';
    toast.className = 'gizi-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

function initKalkulatorGizi() {
  const tipeSelect  = document.getElementById('gizi-tipe');
  const beratInput  = document.getElementById('gizi-berat');
  const sliderInput = document.getElementById('gizi-slider');
  const fokusSelect = document.getElementById('gizi-fokus');

  if (!tipeSelect || !beratInput) return;

  // Real-time recalculation on input changes
  [tipeSelect, fokusSelect].forEach(select => {
    if (select) select.addEventListener('change', hitungGizi);
  });

  if (beratInput) {
    beratInput.addEventListener('input', () => {
      if (sliderInput) sliderInput.value = beratInput.value;
      // remove preset active highlights if custom
      document.querySelectorAll('.gizi-preset-btn').forEach(b => {
        if (b.getAttribute('data-gram') == beratInput.value) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
      hitungGizi();
    });
  }

  if (sliderInput) {
    sliderInput.addEventListener('input', () => {
      if (beratInput) beratInput.value = sliderInput.value;
      document.querySelectorAll('.gizi-preset-btn').forEach(b => {
        if (b.getAttribute('data-gram') == sliderInput.value) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
      hitungGizi();
    });
  }

  // Initial calculation
  hitungGizi();
}

/* ============================================================
   7. PERAWATAN TAB SWITCHER
   ============================================================ */
function switchTab(tabId) {
  // Hide all panels
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  // Deactivate all buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });

  // Show selected panel
  const panel = document.getElementById(`panel-${tabId}`);
  const btn   = document.getElementById(`tab-${tabId}`);

  if (panel) panel.classList.add('active');
  if (btn)   {
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
  }
}

/* ============================================================
   8. INTERACTIVE CHECKLIST
   ============================================================ */
const CHECKLIST_ITEMS = [
  { id: 'c1',  text: '☀️ Pastikan tanaman mendapat 6–8 jam sinar matahari',        freq: 'Harian' },
  { id: 'c2',  text: '💧 Siram di pangkal batang pagi hari (06.00–08.00)',           freq: 'Harian' },
  { id: 'c3',  text: '🔍 Periksa daun bawah untuk mendeteksi hama/penyakit dini',   freq: 'Harian' },
  { id: 'c4',  text: '🌼 Goyang-goyang batang ringan untuk bantu penyerbukan',       freq: 'Harian' },
  { id: 'c5',  text: '✂️ Buang tunas air (sucker) yang muncul di ketiak daun',       freq: 'Mingguan' },
  { id: 'c6',  text: '🪵 Periksa ikatan ajir dan kencangkan jika perlu',             freq: 'Mingguan' },
  { id: 'c7',  text: '🌿 Pangkas daun tua, rusak, atau menguning di bawah',          freq: 'Mingguan' },
  { id: 'c8',  text: '🧪 Berikan pupuk sesuai fase pertumbuhan tanaman',              freq: 'Mingguan' },
  { id: 'c9',  text: '🌾 Tambahkan mulsa jika sudah menipis di permukaan tanah',     freq: 'Mingguan' },
  { id: 'c10', text: '🐛 Semprot pestisida organik (neem oil) jika ada gejala hama', freq: 'Kondisional' },
  { id: 'c11', text: '📏 Catat tinggi tanaman dan jumlah tandan bunga/buah',         freq: 'Mingguan' },
  { id: 'c12', text: '⚗️ Cek pH tanah dan kelembapan media tanam',                   freq: 'Mingguan' },
  { id: 'c13', text: '🍅 Panen buah yang sudah 80–90% merah dan sedikit lunak',      freq: 'Panen' },
  { id: 'c14', text: '🧹 Bersihkan gulma di sekitar tanaman agar tidak rebutan hara', freq: 'Mingguan' },
];

const CHECKLIST_KEY = 'tomatpedia-checklist';

function loadChecklist() {
  try {
    return JSON.parse(localStorage.getItem(CHECKLIST_KEY)) || {};
  } catch {
    return {};
  }
}

function saveChecklist(state) {
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify(state));
}

function renderChecklist() {
  const container = document.getElementById('checklist-items');
  if (!container) return;

  const state = loadChecklist();
  container.innerHTML = '';

  const FREQ_COLORS = {
    'Harian':      '#52B788',
    'Mingguan':    '#4361EE',
    'Kondisional': '#F4845F',
    'Panen':       '#E63946',
  };

  CHECKLIST_ITEMS.forEach(item => {
    const done = !!state[item.id];
    const li = document.createElement('div');
    li.className = `check-item ${done ? 'done' : ''}`;
    li.setAttribute('role', 'listitem');
    li.setAttribute('aria-label', `${done ? 'Selesai' : 'Belum selesai'}: ${item.text}`);
    li.setAttribute('tabindex', '0');
    li.setAttribute('id', `checklist-${item.id}`);

    li.innerHTML = `
      <div class="check-box" aria-hidden="true"></div>
      <span class="check-label">
        ${item.text}
        <span style="
          display:inline-block;margin-left:4px;padding:1px 7px;
          background:${FREQ_COLORS[item.freq]}22;
          color:${FREQ_COLORS[item.freq]};
          border-radius:999px;font-size:0.7rem;font-weight:700;
          vertical-align:middle;
        ">${item.freq}</span>
      </span>
    `;

    const toggle = () => {
      const s = loadChecklist();
      s[item.id] = !s[item.id];
      saveChecklist(s);
      renderChecklist();
    };

    li.addEventListener('click', toggle);
    li.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
    });

    container.appendChild(li);
  });

  updateChecklistProgress(state);
}

function updateChecklistProgress(state) {
  const done  = Object.values(state).filter(Boolean).length;
  const total = CHECKLIST_ITEMS.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  const fill = document.getElementById('checklist-progress-fill');
  const text = document.getElementById('checklist-progress-text');
  if (fill) fill.style.width = `${pct}%`;
  if (text) text.textContent = `${done} / ${total}`;
}

function resetChecklist() {
  saveChecklist({});
  renderChecklist();
}

/* ============================================================
   9. NUTRITION BAR ANIMATION (Intersection Observer)
   ============================================================ */
function initNutritionBars() {
  const bars = document.querySelectorAll('.bar-fill');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const width  = target.style.width; // Already set in HTML
          target.style.width = '0%';

          requestAnimationFrame(() => {
            setTimeout(() => {
              target.style.width = width;
            }, 100);
          });
          observer.unobserve(target);
        }
      });
    },
    { threshold: 0.5 }
  );

  bars.forEach(bar => {
    const stored = bar.style.width;
    bar.setAttribute('data-target-width', stored);
    bar.style.width = '0%';
    observer.observe(bar);
  });
}

/* ============================================================
   10. SET DEFAULT DATE FOR KALKULATOR (today's date)
   ============================================================ */
function setDefaultDate() {
  const input = document.getElementById('tanggal-semai');
  if (!input) return;
  const today = new Date();
  const year  = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day   = String(today.getDate()).padStart(2, '0');
  input.value = `${year}-${month}-${day}`;
  // Also set max date to 1 year ago (reasonable semai date range)
  const minDate = new Date(today);
  minDate.setFullYear(today.getFullYear() - 1);
  input.min = `${minDate.getFullYear()}-${String(minDate.getMonth()+1).padStart(2,'0')}-${String(minDate.getDate()).padStart(2,'0')}`;
}

/* ============================================================
   11. ALLOW KALKULATOR ON ENTER KEY
   ============================================================ */
function initKalkulatorKeyboard() {
  ['tanggal-semai', 'varietas-tomat'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') hitungPanen();
      });
    }
  });
}

/* ============================================================
   12. SMOOTH SCROLL ON SAME-PAGE ANCHORS
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#' || href.length <= 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = 80; // Navbar height
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ============================================================
   13. HERO IMAGE: Try to use generated image if available
   ============================================================ */
function initHeroImage() {
  const container = document.getElementById('hero-image-container');
  if (!container) return;

  const possiblePaths = [
    './assets/hero-tomato.png',
    './assets/hero-tomato.webp',
    './assets/hero-tomato.jpg',
  ];

  function tryNext(index) {
    if (index >= possiblePaths.length) return; // Keep placeholder
    const img = new Image();
    img.onload = () => {
      const placeholder = document.getElementById('hero-placeholder');
      if (placeholder) placeholder.remove();
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
      img.alt = 'Tanaman tomat segar dengan buah merah matang menggantung di tangkai';
      container.appendChild(img);
    };
    img.onerror = () => tryNext(index + 1);
    img.src = possiblePaths[index];
  }

  tryNext(0);
}

/* ============================================================
   14. COUNTER ANIMATION FOR FAKTA SECTION
   ============================================================ */
function animateCounter(el, target, suffix, duration = 1800) {
  let start = 0;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current  = Math.floor(eased * target);
    el.textContent = current.toLocaleString('id-ID') + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString('id-ID') + suffix;
  };
  requestAnimationFrame(step);
}

/* ============================================================
   15. FAQ ACCORDION
   ============================================================ */
function initFaq() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        items.forEach(i => i.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });
}

/* ============================================================
   MASTER INIT — DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Navigation & Theme
  initActiveNavLink();
  initHamburger();
  initSmoothScroll();

  // Animations & Elements
  initReveal();
  initHeroImage();
  initFaq();

  // Page Specific Widgets (safe if element doesn't exist)
  initKalkulatorKeyboard();
  setDefaultDate();
  initNutritionBars();
  renderChecklist();
  initKalkulatorGizi();

  // Scroll events
  window.addEventListener('scroll', () => {
    updateScrollProgress();
    updateNavbar();
  }, { passive: true });

  // Initial calls
  updateScrollProgress();
  updateNavbar();
});

/* ============================================================
   GLOBAL EXPORTS (used in HTML onclick attributes)
   ============================================================ */
window.hitungPanen        = hitungPanen;
window.switchTab          = switchTab;
window.resetChecklist     = resetChecklist;
window.closeMobileNav     = closeMobileNav;
window.hitungGizi         = hitungGizi;
window.setGiziPreset      = setGiziPreset;
window.resetGizi          = resetGizi;
window.salinRingkasanGizi = salinRingkasanGizi;
