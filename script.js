/* ===================== Mayukha EchoNest — Site Script ===================== */

/* ---------- CONFIG ----------
   To make the availability calendar editable by resort staff without touching
   code, connect it to a Google Sheet:

   1. Create a Google Sheet with three columns, starting row 2:
        A: Date (YYYY-MM-DD)   B: Status (available / limited / booked)   C: Note (optional)
   2. File -> Share -> "Anyone with the link" -> Viewer.
   3. Copy the Sheet ID from its URL:
        https://docs.google.com/spreadsheets/d/  <-- THIS PART -->  /edit
   4. Paste it below as SHEET_ID. That's it — no republishing needed, edits
      reflect on the site within moments.

   Until a real SHEET_ID is set, the calendar runs on realistic built-in
   sample data so the site is fully functional out of the box.
------------------------------- */
const AVAILABILITY_CONFIG = {
  SHEET_ID: "",      // <-- paste your Google Sheet ID here
  SHEET_GID: "0",
  WHATSAPP_NUMBER: "919160700775"
};

/* ---------- Dark / light theme toggle ---------- */
const themeToggle = document.getElementById('themeToggle');

function applyTheme(theme) {
  if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
  else document.documentElement.removeAttribute('data-theme');
  themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
  document.getElementById('themeColorMeta').setAttribute('content', theme === 'light' ? '#faf6ef' : '#0d0b09');
  localStorage.setItem('theme', theme);
}
applyTheme(localStorage.getItem('theme') === 'light' ? 'light' : 'dark');
themeToggle.addEventListener('click', () => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  applyTheme(isLight ? 'dark' : 'light');
});

/* ---------- Walkthrough video mute toggles ---------- */
document.querySelectorAll('.video-frame').forEach(frame => {
  const video = frame.querySelector('video');
  const toggle = frame.querySelector('.video-mute-toggle');
  toggle.addEventListener('click', () => {
    video.muted = !video.muted;
    toggle.classList.toggle('unmuted', !video.muted);
    toggle.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
  });
});

/* ---------- Nav scroll + mobile menu ---------- */
const nav = document.getElementById('siteNav');
const burger = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  document.getElementById('progressFill').style.width = scrolled + '%';
}, { passive: true });

burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  burger.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  burger.classList.remove('open');
}));

/* ---------- Magnetic buttons ---------- */
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

/* ---------- Scroll reveal ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---------- Slider ---------- */
const track = document.getElementById('sliderTrack');
const slides = Array.from(track.children);
const dotsWrap = document.getElementById('sliderDots');
let current = 0;

slides.forEach((_, i) => {
  const b = document.createElement('button');
  if (i === 0) b.classList.add('active');
  b.addEventListener('click', () => goToSlide(i));
  dotsWrap.appendChild(b);
});
const dots = Array.from(dotsWrap.children);

function goToSlide(i) {
  current = (i + slides.length) % slides.length;
  track.style.transform = `translateX(-${current * 100}%)`;
  dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
}
document.getElementById('prevSlide').addEventListener('click', () => goToSlide(current - 1));
document.getElementById('nextSlide').addEventListener('click', () => goToSlide(current + 1));

let autoplay = setInterval(() => goToSlide(current + 1), 4800);
const sliderEl = document.getElementById('slider');
sliderEl.addEventListener('mouseenter', () => clearInterval(autoplay));
sliderEl.addEventListener('mouseleave', () => { autoplay = setInterval(() => goToSlide(current + 1), 4800); });

/* touch swipe */
let touchStartX = 0;
sliderEl.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX, { passive: true });
sliderEl.addEventListener('touchend', e => {
  const diff = e.changedTouches[0].clientX - touchStartX;
  if (diff > 50) goToSlide(current - 1);
  else if (diff < -50) goToSlide(current + 1);
}, { passive: true });

/* ---------- WhatsApp links ---------- */
const baseWaText = "Hi Mayukha EchoNest, I'd like to check availability for a booking.";
const baseWaUrl = `https://wa.me/${AVAILABILITY_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(baseWaText)}`;
document.getElementById('heroWhatsapp').href = baseWaUrl;
document.getElementById('calWhatsapp').href = baseWaUrl;
document.getElementById('year').textContent = new Date().getFullYear();

/* ===================== Availability Calendar ===================== */
const calGrid = document.getElementById('calGrid');
const calMonthLabel = document.getElementById('calMonthLabel');
const calSyncStatus = document.getElementById('calSyncStatus');
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

let today = new Date();
today.setHours(0,0,0,0);
let viewYear = today.getFullYear();
let viewMonth = today.getMonth();
let availabilityData = {}; // { 'YYYY-MM-DD': {status, note} }

function pad(n){ return n < 10 ? '0'+n : ''+n; }
function dateKey(y,m,d){ return `${y}-${pad(m+1)}-${pad(d)}`; }

function buildFallbackData() {
  const data = {};
  const start = new Date(today);
  for (let i = 0; i < 90; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
    const dow = d.getDay();
    let status = 'available';
    if (dow === 6) status = 'booked';        // Saturdays tend to book out
    else if (dow === 5 || dow === 0) status = 'limited'; // Fri/Sun filling up
    data[key] = { status, note: '' };
  }
  return data;
}

function parseGvizDate(raw) {
  // gviz returns "Date(2026,6,17)" for date cells, or plain strings for text cells
  const m = /Date\((\d+),(\d+),(\d+)\)/.exec(raw);
  if (m) return dateKey(+m[1], +m[2], +m[3]);
  return raw; // assume already YYYY-MM-DD text
}

async function loadAvailability() {
  if (!AVAILABILITY_CONFIG.SHEET_ID) {
    availabilityData = buildFallbackData();
    calSyncStatus.textContent = "For the most accurate availability, message us directly on WhatsApp.";
    renderCalendar();
    return;
  }
  try {
    const url = `https://docs.google.com/spreadsheets/d/${AVAILABILITY_CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&gid=${AVAILABILITY_CONFIG.SHEET_GID}`;
    const res = await fetch(url);
    const text = await res.text();
    const match = /google\.visualization\.Query\.setResponse\(([\s\S]*)\);?\s*$/.exec(text);
    const json = JSON.parse(match[1]);
    const rows = json.table.rows;
    const data = {};
    rows.forEach(r => {
      const cells = r.c;
      if (!cells || !cells[0] || !cells[1]) return;
      const key = parseGvizDate(cells[0].v ?? cells[0].f);
      const status = (cells[1].v || '').toString().trim().toLowerCase();
      const note = cells[2] ? (cells[2].v || '') : '';
      if (['available','limited','booked'].includes(status)) {
        data[key] = { status, note };
      }
    });
    availabilityData = data;
    calSyncStatus.textContent = "Live availability, synced from the booking sheet.";
  } catch (err) {
    availabilityData = buildFallbackData();
    calSyncStatus.textContent = "For the most accurate availability, message us directly on WhatsApp.";
  }
  renderCalendar();
}

function renderCalendar() {
  calGrid.innerHTML = '';
  calMonthLabel.textContent = `${monthNames[viewMonth]} ${viewYear}`;

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day empty';
    calGrid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    const cellDate = new Date(viewYear, viewMonth, d);
    const key = dateKey(viewYear, viewMonth, d);
    const isPast = cellDate < today;
    const isToday = cellDate.getTime() === today.getTime();
    const info = availabilityData[key];
    const status = info ? info.status : 'available';

    cell.className = `cal-day ${status}`;
    if (isPast) cell.className = 'cal-day past';
    if (isToday) cell.classList.add('today');
    cell.innerHTML = `${d}${!isPast ? `<span class="dot dot-${status}"></span>` : ''}`;

    if (!isPast && status !== 'booked') {
      cell.addEventListener('click', () => {
        const label = cellDate.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
        const msg = `Hi Mayukha EchoNest, I'd like to check availability for booking on ${label}.`;
        window.open(`https://wa.me/${AVAILABILITY_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
      });
    }
    calGrid.appendChild(cell);
  }
}

document.getElementById('calPrev').addEventListener('click', () => {
  viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; }
  renderCalendar();
});
document.getElementById('calNext').addEventListener('click', () => {
  viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; }
  renderCalendar();
});

loadAvailability();
