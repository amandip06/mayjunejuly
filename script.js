/**
 * TARGET26 — MISSION CONTROL
 * script.js — Full Application Logic
 *
 * Architecture:
 *  - All data stored in localStorage
 *  - No backend required
 *  - Modular functions with comments
 */

// ══════════════════════════════════════════════════
//  CONFIGURATION
// ══════════════════════════════════════════════════

/** Mission date range */
const MISSION_START = new Date('2026-05-13');
const MISSION_END   = new Date('2026-07-13');

/** Task definitions — name, emoji, minutes per day */
const TASKS = [
  { id: 'spanish', name: 'Learn Spanish', icon: '🇪🇸', minutes: 30 },
  { id: 'workout', name: 'Workout',        icon: '💪', minutes: 60 },
  { id: 'java',    name: 'Learn Java',     icon: '☕', minutes: 90 },
];

/** localStorage keys */
const KEYS = {
  password:   'tg26_password',
  loggedIn:   'tg26_loggedIn',
  active:     'tg26_active',
  progress:   'tg26_progress',
  theme:      'tg26_theme',
  animations: 'tg26_animations',
};

/** Default password */
const DEFAULT_PASSWORD = 'TARGET26';

/** Motivational quotes pool */
const QUOTES = [
  { text: "Every expert was once a beginner. Keep going.", threshold: 0 },
  { text: "The secret to getting ahead is getting started.", threshold: 0 },
  { text: "Don't count the days — make the days count.", threshold: 20 },
  { text: "Discipline is doing what needs to be done, even when you don't want to.", threshold: 20 },
  { text: "You're halfway there. The finish line is closer than the start.", threshold: 40 },
  { text: "Momentum is everything. You've built it — don't break it.", threshold: 50 },
  { text: "Champions train hardest when no one is watching.", threshold: 60 },
  { text: "The last stretch is the hardest. Push through.", threshold: 80 },
  { text: "You are one decision away from a completely different life.", threshold: 0 },
  { text: "Great things never come from comfort zones.", threshold: 30 },
  { text: "Success is the sum of small efforts, repeated day in and day out.", threshold: 0 },
  { text: "Be stronger than your excuses.", threshold: 0 },
];

// ══════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════

/** Currently selected date for the Today view (Date object) */
let selectedDate = new Date();

/** Chart instances — kept to destroy before re-creating */
let charts = { dashboard: null, daily: null, task: null, overall: null };

// ══════════════════════════════════════════════════
//  STORAGE HELPERS
// ══════════════════════════════════════════════════

/** Get all progress data from localStorage */
function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.progress) || '{}');
  } catch { return {}; }
}

/** Save progress data to localStorage */
function saveProgress(data) {
  localStorage.setItem(KEYS.progress, JSON.stringify(data));
}

/** Get a date key string like "2026-05-13" */
function dateKey(d) {
  return d.toISOString().split('T')[0];
}

/** Get progress for a specific date */
function getDayProgress(d) {
  const prog = getProgress();
  return prog[dateKey(d)] || { spanish: false, workout: false, java: false };
}

/** Save progress for a specific date */
function setDayProgress(d, data) {
  const prog = getProgress();
  prog[dateKey(d)] = data;
  saveProgress(prog);
}

// ══════════════════════════════════════════════════
//  DATE HELPERS
// ══════════════════════════════════════════════════

/** Get all mission days as an array of Date objects */
function getMissionDays() {
  const days = [];
  const d = new Date(MISSION_START);
  while (d <= MISSION_END) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

/** Get total number of mission days (inclusive) */
function totalMissionDays() {
  return getMissionDays().length;
}

/** Check if a date is within the mission range */
function isInMission(d) {
  const day = new Date(d); day.setHours(0,0,0,0);
  const start = new Date(MISSION_START); start.setHours(0,0,0,0);
  const end   = new Date(MISSION_END);   end.setHours(0,0,0,0);
  return day >= start && day <= end;
}

/** Check if a date is today */
function isToday(d) {
  const today = new Date();
  return dateKey(d) === dateKey(today);
}

/** Check if a date is in the future (after today) */
function isFuture(d) {
  const today = new Date(); today.setHours(0,0,0,0);
  const day   = new Date(d); day.setHours(0,0,0,0);
  return day > today;
}

/** Format a date nicely: "Wed, 13 May 2026" */
function formatDate(d) {
  return d.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  }).toUpperCase();
}

/** Format a date short: "13 May" */
function formatDateShort(d) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();
}

// ══════════════════════════════════════════════════
//  ANALYTICS HELPERS
// ══════════════════════════════════════════════════

/** Get how many tasks are done for a given day's data object */
function countDone(dayData) {
  return TASKS.filter(t => dayData[t.id]).length;
}

/** Get completion % for a day */
function dayPercent(dayData) {
  return Math.round((countDone(dayData) / TASKS.length) * 100);
}

/** Get total minutes completed for a day */
function dayMinutes(dayData) {
  return TASKS.reduce((sum, t) => sum + (dayData[t.id] ? t.minutes : 0), 0);
}

/** Compute full analytics from progress data */
function computeAnalytics() {
  const days = getMissionDays();
  const today = new Date(); today.setHours(0,0,0,0);
  const prog  = getProgress();

  let completedDays = 0;
  let missedDays    = 0;
  let taskTotals    = { spanish: 0, workout: 0, java: 0 };
  let totalTaskDone = 0;
  let totalPossible = 0;

  // Calculate streak
  let currentStreak = 0;
  let bestStreak    = 0;
  let tempStreak    = 0;

  // Days elapsed (past days)
  const pastDays = days.filter(d => {
    const dd = new Date(d); dd.setHours(0,0,0,0);
    return dd <= today;
  });

  pastDays.forEach(d => {
    const key     = dateKey(d);
    const dayData = prog[key] || {};
    const done    = countDone(dayData);
    const tasks   = TASKS.length;

    totalPossible += tasks;
    totalTaskDone += done;
    TASKS.forEach(t => { if (dayData[t.id]) taskTotals[t.id]++; });

    if (done === tasks) {
      completedDays++;
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      if (done > 0) missedDays++;
      else if (key in prog) missedDays++;
      tempStreak = 0;
    }
  });

  // Current streak: count backwards from today
  let cs = 0;
  for (let i = pastDays.length - 1; i >= 0; i--) {
    const key  = dateKey(pastDays[i]);
    const data = prog[key] || {};
    if (countDone(data) === TASKS.length) cs++;
    else break;
  }
  currentStreak = cs;

  // Overall percentage across all task completions in past days
  const overallPercent = totalPossible > 0
    ? Math.round((totalTaskDone / totalPossible) * 100)
    : 0;

  // Task percentages
  const taskPercent = {};
  TASKS.forEach(t => {
    taskPercent[t.id] = pastDays.length > 0
      ? Math.round((taskTotals[t.id] / pastDays.length) * 100)
      : 0;
  });

  // Total minutes per task
  const taskMinutes = {};
  TASKS.forEach(t => {
    taskMinutes[t.id] = taskTotals[t.id] * t.minutes;
  });

  return {
    totalDays:     days.length,
    pastDays:      pastDays.length,
    completedDays,
    missedDays,
    currentStreak,
    bestStreak,
    overallPercent,
    taskTotals,
    taskPercent,
    taskMinutes,
    totalTaskDone,
    totalPossible,
  };
}

/** Format minutes as "Xh Ym" */
function fmtMinutes(m) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h === 0) return `${min}m`;
  if (min === 0) return `${h}h`;
  return `${h}h ${min}m`;
}

// ══════════════════════════════════════════════════
//  QUOTES
// ══════════════════════════════════════════════════

/** Pick a relevant motivational quote based on progress % */
function getQuote(percent) {
  // Filter quotes whose threshold ≤ percent
  const eligible = QUOTES.filter(q => q.threshold <= percent);
  if (!eligible.length) return QUOTES[0];
  // Return random eligible quote
  return eligible[Math.floor(Math.random() * eligible.length)];
}

// ══════════════════════════════════════════════════
//  LOADING SCREEN
// ══════════════════════════════════════════════════

/** Animate loading bar and then boot the app */
function initLoadingScreen() {
  const bar = document.getElementById('loadingBar');
  let pct   = 0;
  const iv  = setInterval(() => {
    pct += Math.random() * 15 + 5;
    if (pct >= 100) { pct = 100; clearInterval(iv); }
    bar.style.width = pct + '%';
    if (pct >= 100) {
      setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('fade-out');
        setTimeout(bootApp, 600);
      }, 300);
    }
  }, 120);
}

// ══════════════════════════════════════════════════
//  BOOT / AUTH
// ══════════════════════════════════════════════════

/** Determine which screen to show after loading */
function bootApp() {
  // Check if system is active
  const isActive = localStorage.getItem(KEYS.active) !== 'false';
  if (!isActive) {
    show('deactivatedScreen');
    return;
  }

  // Check if logged in
  const loggedIn = localStorage.getItem(KEYS.loggedIn) === 'true';
  if (loggedIn) {
    showMainApp();
  } else {
    show('loginScreen');
    spawnParticles();
  }
}

/** Handle login button click */
function handleLogin() {
  const input    = document.getElementById('passwordInput').value;
  const stored   = localStorage.getItem(KEYS.password) || DEFAULT_PASSWORD;
  const errEl    = document.getElementById('loginError');

  if (input === stored) {
    // Save login state
    localStorage.setItem(KEYS.loggedIn, 'true');
    errEl.classList.add('hidden');

    // Fade out login card then show app
    const card = document.querySelector('.login-card');
    card.style.opacity = '0';
    card.style.transform = 'scale(0.95)';
    card.style.transition = 'all 0.4s ease';
    setTimeout(() => {
      hide('loginScreen');
      showMainApp();
    }, 400);
  } else {
    errEl.classList.remove('hidden');
    const input = document.getElementById('passwordInput');
    input.style.borderColor = 'var(--accent-red)';
    setTimeout(() => { input.style.borderColor = ''; }, 1000);
  }
}

/** Handle Enter key on password inputs */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('passwordInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
});

/** Logout */
function handleLogout() {
  localStorage.removeItem(KEYS.loggedIn);
  hide('mainApp');
  show('loginScreen');
  document.getElementById('passwordInput').value = '';
  spawnParticles();
}

// ══════════════════════════════════════════════════
//  MAIN APP INIT
// ══════════════════════════════════════════════════

/** Show the main app and populate all data */
function showMainApp() {
  show('mainApp');

  // Apply saved theme
  const savedTheme = localStorage.getItem(KEYS.theme) || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.getElementById('themeToggle').checked = (savedTheme === 'dark');

  // Apply animations preference
  const animOff = localStorage.getItem(KEYS.animations) === 'false';
  if (animOff) document.body.classList.add('no-animations');
  document.getElementById('animToggle').checked = !animOff;

  // Set activation toggle
  const isActive = localStorage.getItem(KEYS.active) !== 'false';
  document.getElementById('activationToggle').checked = isActive;
  updateActivationStatus(isActive);

  // Set today's date
  const today = new Date();
  document.getElementById('todayDateDisplay').textContent  = formatDate(today);
  document.getElementById('todayDateDisplay2').textContent = formatDate(today);

  // Init selected date as today (clamped to mission range)
  if (isInMission(today)) {
    selectedDate = new Date(today);
  } else if (today < MISSION_START) {
    selectedDate = new Date(MISSION_START);
  } else {
    selectedDate = new Date(MISSION_END);
  }

  // Render everything
  refreshDashboard();
  renderToday();
  renderCalendar();
  renderHistory('all');
  renderAnalytics();
  showSection('dashboard');
}

// ══════════════════════════════════════════════════
//  SECTION NAVIGATION
// ══════════════════════════════════════════════════

/** Switch to a named section */
function showSection(name) {
  // Deactivate all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidenav-btn').forEach(b => b.classList.remove('active'));

  // Activate target
  document.getElementById('sec-' + name).classList.add('active');
  document.querySelector(`[data-section="${name}"]`).classList.add('active');

  // Refresh charts when entering analytics
  if (name === 'analytics') {
    setTimeout(renderAnalytics, 50);
  }
}

// ══════════════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════════════

/** Refresh all dashboard data */
function refreshDashboard() {
  const an = computeAnalytics();

  // Stat cards
  document.getElementById('statTotalDays').textContent     = an.totalDays;
  document.getElementById('statCompletedDays').textContent = an.completedDays;
  document.getElementById('statMissedDays').textContent    = an.missedDays;
  document.getElementById('statBestStreak').textContent    = an.bestStreak;
  document.getElementById('sidebarStreak').textContent     = an.currentStreak;

  // Overall progress bar
  document.getElementById('overallPercent').textContent   = an.overallPercent + '%';
  document.getElementById('overallProgressBar').style.width = an.overallPercent + '%';
  document.getElementById('progressDaysInfo').textContent =
    `Day ${an.pastDays} of ${an.totalDays} · ${an.completedDays} completed`;

  // Task bars
  TASKS.forEach(t => {
    document.getElementById('pct' + capitalize(t.id)).textContent = an.taskPercent[t.id] + '%';
    document.getElementById('bar' + capitalize(t.id)).style.width  = an.taskPercent[t.id] + '%';
    document.getElementById('time' + capitalize(t.id)).textContent = fmtMinutes(an.taskMinutes[t.id]);
  });

  // Quote
  const q = getQuote(an.overallPercent);
  document.getElementById('quoteText').textContent = q.text;

  // Mini dashboard chart
  renderDashboardChart();
}

/** Capitalize first letter */
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ══════════════════════════════════════════════════
//  TODAY VIEW
// ══════════════════════════════════════════════════

/** Render the today/date task checklist */
function renderToday() {
  const container = document.getElementById('tasksContainer');
  const key       = dateKey(selectedDate);
  const dayData   = getDayProgress(selectedDate);
  const future    = isFuture(selectedDate);
  const inMission = isInMission(selectedDate);

  // Date label
  document.getElementById('selectedDateLabel').textContent = formatDate(selectedDate);

  // Status bar
  const statusBar = document.getElementById('todayStatusBar');
  if (!inMission) {
    statusBar.textContent = '⚠ THIS DATE IS OUTSIDE THE MISSION RANGE (13 MAY – 13 JUL 2026)';
    statusBar.style.color = 'var(--accent-red)';
  } else if (future) {
    statusBar.textContent = '⏳ FUTURE DATE — TASKS CANNOT BE CHECKED YET';
    statusBar.style.color = 'var(--accent-gold)';
  } else if (isToday(selectedDate)) {
    statusBar.textContent = "📅 TODAY'S MISSION — MARK TASKS AS COMPLETED";
    statusBar.style.color = 'var(--accent-cyan)';
  } else {
    statusBar.textContent = '📜 PAST DATE — YOU CAN STILL UPDATE RECORDS';
    statusBar.style.color = 'var(--text-secondary)';
  }

  // Build task cards
  container.innerHTML = '';
  TASKS.forEach(task => {
    const done = dayData[task.id] || false;
    const card = document.createElement('div');
    card.className = 'task-card' +
      (done ? ' completed' : '') +
      (!inMission || future ? ' task-future' : '');
    card.innerHTML = `
      <div class="task-check">${done ? '✓' : ''}</div>
      <div class="task-info">
        <div class="task-name">${task.icon}  ${task.name}</div>
        <div class="task-meta">DAILY TARGET · ${fmtMinutes(task.minutes)}</div>
      </div>
      <div class="task-time">${fmtMinutes(task.minutes)}</div>
    `;

    // Allow clicking only within mission range and not future
    if (inMission && !future) {
      card.addEventListener('click', () => toggleTask(task.id));
    }
    container.appendChild(card);
  });

  // Update summary
  updateTodaySummary(dayData);
}

/** Toggle a task for the selected date */
function toggleTask(taskId) {
  const dayData  = getDayProgress(selectedDate);
  dayData[taskId] = !dayData[taskId];
  setDayProgress(selectedDate, dayData);

  // Re-render
  renderToday();
  refreshDashboard();
  renderCalendar();
  renderHistory('all');
}

/** Update the summary cards below tasks */
function updateTodaySummary(dayData) {
  const done    = countDone(dayData);
  const minutes = dayMinutes(dayData);
  const pct     = dayPercent(dayData);

  document.getElementById('tsCompleted').textContent = `${done}/${TASKS.length}`;
  document.getElementById('tsTime').textContent      = fmtMinutes(minutes);
  document.getElementById('tsPercent').textContent   = pct + '%';
}

/** Navigate to previous or next day */
function navigateDate(dir) {
  const d = new Date(selectedDate);
  d.setDate(d.getDate() + dir);
  if (isInMission(d) || (dir > 0 && d <= new Date()) ) {
    selectedDate = d;
    renderToday();
  }
}

// ══════════════════════════════════════════════════
//  CALENDAR
// ══════════════════════════════════════════════════

/** Render the full mission calendar */
function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  grid.innerHTML = '';

  const today  = new Date(); today.setHours(0,0,0,0);
  const days   = getMissionDays();
  const prog   = getProgress();

  days.forEach(d => {
    const key     = dateKey(d);
    const dayData = prog[key] || {};
    const done    = countDone(dayData);
    const dd      = new Date(d); dd.setHours(0,0,0,0);
    const isFut   = dd > today;
    const isTod   = dateKey(d) === dateKey(today);

    // Determine CSS class
    let cls = 'cal-day';
    if (isTod)        cls += ' cal-today';
    else if (isFut)   cls += ' cal-future';
    else if (done === TASKS.length) cls += ' cal-full';
    else if (done > 0)              cls += ' cal-partial';
    else if (key in prog || !isFut) cls += ' cal-missed';

    // Task dots
    const dots = TASKS.map(t => {
      if (isFut) return `<div class="cal-dot empty"></div>`;
      return `<div class="cal-dot ${dayData[t.id] ? 'done' : 'miss'}"></div>`;
    }).join('');

    const el = document.createElement('div');
    el.className = cls;
    el.innerHTML = `
      <div class="cal-date">${d.getDate()}</div>
      <div class="cal-month-label">${d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}</div>
      <div class="cal-day-status">${dots}</div>
    `;

    // Click to jump to that day in Today view
    if (!isFut) {
      el.addEventListener('click', () => {
        selectedDate = new Date(d);
        showSection('today');
        renderToday();
      });
    }

    grid.appendChild(el);
  });
}

// ══════════════════════════════════════════════════
//  HISTORY
// ══════════════════════════════════════════════════

/** Render the history list with optional filter */
function renderHistory(filter) {
  const list  = document.getElementById('historyList');
  const prog  = getProgress();
  const today = new Date(); today.setHours(0,0,0,0);
  const days  = getMissionDays().filter(d => {
    const dd = new Date(d); dd.setHours(0,0,0,0);
    return dd <= today;
  }).reverse(); // Most recent first

  list.innerHTML = '';
  let count = 0;

  days.forEach(d => {
    const key     = dateKey(d);
    const dayData = prog[key] || {};
    const done    = countDone(dayData);
    const pct     = dayPercent(dayData);

    // Apply filter
    if (filter === 'complete' && done !== TASKS.length) return;
    if (filter === 'partial'  && !(done > 0 && done < TASKS.length)) return;
    if (filter === 'missed'   && done !== 0) return;

    count++;
    const item = document.createElement('div');
    item.className = 'history-item';

    const pctClass = pct === 100 ? 'p100' : pct >= 66 ? 'p66' : pct >= 33 ? 'p33' : 'p0';

    const badges = TASKS.map(t => `
      <span class="hist-task-badge ${dayData[t.id] ? 'badge-done' : 'badge-miss'}">
        ${t.icon} ${t.name}
      </span>
    `).join('');

    item.innerHTML = `
      <div class="hist-date">${formatDateShort(d)}</div>
      <div class="hist-tasks">${badges}</div>
      <div class="hist-pct ${pctClass}">${pct}%</div>
    `;

    // Click to view in Today section
    item.addEventListener('click', () => {
      selectedDate = new Date(d);
      showSection('today');
      renderToday();
    });

    list.appendChild(item);
  });

  if (count === 0) {
    list.innerHTML = `<div style="text-align:center;padding:40px;font-family:var(--font-mono);
      font-size:0.75rem;color:var(--text-muted);letter-spacing:2px;">NO RECORDS FOUND</div>`;
  }
}

/** Switch history filter */
function filterHistory(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderHistory(filter);
}

// ══════════════════════════════════════════════════
//  ANALYTICS
// ══════════════════════════════════════════════════

/** Render analytics section */
function renderAnalytics() {
  const an = computeAnalytics();

  document.getElementById('anStreak').textContent     = an.currentStreak + ' 🔥';
  document.getElementById('anBestStreak').textContent = an.bestStreak + ' ⭐';
  document.getElementById('anOverall').textContent    = an.overallPercent + '%';

  // Total time
  const totalMin = TASKS.reduce((s, t) => s + an.taskMinutes[t.id], 0);
  document.getElementById('anTotalTime').textContent = fmtMinutes(totalMin);

  // Charts
  renderDailyChart();
  renderTaskChart();
  renderOverallChart();
}

// ══════════════════════════════════════════════════
//  CHARTS
// ══════════════════════════════════════════════════

/** Common Chart.js defaults */
const chartDefaults = {
  animation: { duration: 600 },
  plugins: {
    legend: {
      labels: {
        color: '#7ab0d4',
        font: { family: 'Share Tech Mono', size: 10 },
        boxWidth: 12,
      }
    },
    tooltip: {
      backgroundColor: 'rgba(5,15,40,0.95)',
      borderColor: 'rgba(0,200,255,0.3)',
      borderWidth: 1,
      titleFont: { family: 'Orbitron', size: 11 },
      bodyFont:  { family: 'Share Tech Mono', size: 11 },
      titleColor: '#00d4ff',
      bodyColor:  '#7ab0d4',
    }
  },
  scales: {
    x: {
      ticks: { color: '#3a6080', font: { family: 'Share Tech Mono', size: 10 } },
      grid:  { color: 'rgba(0,200,255,0.05)' },
      border: { color: 'rgba(0,200,255,0.1)' }
    },
    y: {
      ticks: { color: '#3a6080', font: { family: 'Share Tech Mono', size: 10 } },
      grid:  { color: 'rgba(0,200,255,0.05)' },
      border: { color: 'rgba(0,200,255,0.1)' },
      beginAtZero: true,
    }
  }
};

/** Destroy a chart instance safely */
function destroyChart(key) {
  if (charts[key]) { charts[key].destroy(); charts[key] = null; }
}

/** Dashboard mini chart — last 7 days completion % */
function renderDashboardChart() {
  destroyChart('dashboard');
  const ctx  = document.getElementById('dashboardChart');
  if (!ctx) return;

  const today = new Date(); today.setHours(0,0,0,0);
  const days  = getMissionDays().filter(d => {
    const dd = new Date(d); dd.setHours(0,0,0,0);
    return dd <= today;
  }).slice(-7);

  const prog   = getProgress();
  const labels = days.map(d => formatDateShort(d));
  const data   = days.map(d => dayPercent(prog[dateKey(d)] || {}));

  charts.dashboard = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Completion %',
        data,
        backgroundColor: data.map(v =>
          v === 100 ? 'rgba(0,255,136,0.5)' :
          v > 0     ? 'rgba(0,200,255,0.4)' :
                      'rgba(255,64,96,0.3)'
        ),
        borderColor: data.map(v =>
          v === 100 ? '#00ff88' : v > 0 ? '#00d4ff' : '#ff4060'
        ),
        borderWidth: 1,
        borderRadius: 4,
      }]
    },
    options: {
      ...chartDefaults,
      plugins: { ...chartDefaults.plugins, legend: { display: false } },
      scales: {
        ...chartDefaults.scales,
        y: { ...chartDefaults.scales.y, max: 100 }
      }
    }
  });
}

/** Daily progress chart — last 14 days */
function renderDailyChart() {
  destroyChart('daily');
  const ctx  = document.getElementById('dailyChart');
  if (!ctx) return;

  const today = new Date(); today.setHours(0,0,0,0);
  const days  = getMissionDays().filter(d => {
    const dd = new Date(d); dd.setHours(0,0,0,0);
    return dd <= today;
  }).slice(-14);

  const prog   = getProgress();
  const labels = days.map(d => formatDateShort(d));

  // Dataset per task
  const taskColors = {
    spanish: { bg: 'rgba(0,212,255,0.2)', border: '#00d4ff' },
    workout: { bg: 'rgba(0,255,136,0.2)', border: '#00ff88' },
    java:    { bg: 'rgba(255,140,0,0.2)', border: '#ff8c00' },
  };

  const datasets = TASKS.map(t => ({
    label: t.name,
    data: days.map(d => (prog[dateKey(d)] || {})[t.id] ? 1 : 0),
    backgroundColor: taskColors[t.id].bg,
    borderColor: taskColors[t.id].border,
    borderWidth: 1.5,
    tension: 0.4,
    fill: true,
    pointRadius: 4,
    pointBackgroundColor: taskColors[t.id].border,
  }));

  charts.daily = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      ...chartDefaults,
      scales: {
        ...chartDefaults.scales,
        y: {
          ...chartDefaults.scales.y,
          max: 1,
          ticks: {
            ...chartDefaults.scales.y.ticks,
            callback: v => v === 1 ? '✓' : '✗'
          }
        }
      }
    }
  });
}

/** Task-wise completion doughnut chart */
function renderTaskChart() {
  destroyChart('task');
  const ctx = document.getElementById('taskChart');
  if (!ctx) return;

  const an = computeAnalytics();
  const data = TASKS.map(t => an.taskPercent[t.id]);

  charts.task = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: TASKS.map(t => t.name),
      datasets: [{
        data,
        backgroundColor: ['rgba(0,212,255,0.7)', 'rgba(0,255,136,0.7)', 'rgba(255,140,0,0.7)'],
        borderColor:     ['#00d4ff', '#00ff88', '#ff8c00'],
        borderWidth: 1.5,
        hoverOffset: 8,
      }]
    },
    options: {
      animation: { duration: 600 },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#7ab0d4',
            font: { family: 'Share Tech Mono', size: 10 },
            padding: 16,
          }
        },
        tooltip: chartDefaults.plugins.tooltip,
      },
      cutout: '60%',
    }
  });
}

/** Overall mission bar chart */
function renderOverallChart() {
  destroyChart('overall');
  const ctx = document.getElementById('overallChart');
  if (!ctx) return;

  const an = computeAnalytics();
  const labels = ['Completed Days', 'Partial Days', 'Missed Days', 'Future Days'];
  const partial = an.pastDays - an.completedDays - an.missedDays;
  const future  = an.totalDays - an.pastDays;
  const data    = [an.completedDays, Math.max(0, partial), an.missedDays, future];
  const colors  = [
    'rgba(0,255,136,0.6)', 'rgba(255,215,0,0.6)',
    'rgba(255,64,96,0.6)', 'rgba(100,150,200,0.3)'
  ];
  const borders = ['#00ff88', '#ffd700', '#ff4060', '#6496c8'];

  charts.overall = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Days',
        data,
        backgroundColor: colors,
        borderColor: borders,
        borderWidth: 1,
        borderRadius: 6,
      }]
    },
    options: {
      ...chartDefaults,
      indexAxis: 'y',
      plugins: {
        ...chartDefaults.plugins,
        legend: { display: false }
      },
      scales: {
        x: { ...chartDefaults.scales.x, max: an.totalDays },
        y: { ...chartDefaults.scales.y, ticks: { ...chartDefaults.scales.y.ticks, color: '#7ab0d4' } }
      }
    }
  });
}

// ══════════════════════════════════════════════════
//  SETTINGS
// ══════════════════════════════════════════════════

/** Change the access password */
function changePassword() {
  const curr    = document.getElementById('currentPwd').value;
  const newPwd  = document.getElementById('newPwd').value;
  const confirm = document.getElementById('confirmPwd').value;
  const msgEl   = document.getElementById('pwdMsg');
  const stored  = localStorage.getItem(KEYS.password) || DEFAULT_PASSWORD;

  msgEl.classList.remove('hidden', 'success', 'error');

  if (curr !== stored) {
    msgEl.textContent = '⚠ Current password is incorrect';
    msgEl.classList.add('error');
    return;
  }
  if (newPwd.length < 4) {
    msgEl.textContent = '⚠ New password must be at least 4 characters';
    msgEl.classList.add('error');
    return;
  }
  if (newPwd !== confirm) {
    msgEl.textContent = '⚠ New passwords do not match';
    msgEl.classList.add('error');
    return;
  }

  localStorage.setItem(KEYS.password, newPwd);
  msgEl.textContent = '✓ Password updated successfully';
  msgEl.classList.add('success');
  document.getElementById('currentPwd').value = '';
  document.getElementById('newPwd').value      = '';
  document.getElementById('confirmPwd').value  = '';
  showToast('Password updated!', 'success');
}

/** Toggle system active/inactive */
function toggleActivation() {
  const isActive = document.getElementById('activationToggle').checked;
  localStorage.setItem(KEYS.active, isActive ? 'true' : 'false');
  updateActivationStatus(isActive);
  showToast(isActive ? 'System activated' : 'System deactivated');

  if (!isActive) {
    // Ask user to confirm before showing deactivation screen
    if (confirm('Deactivate now? You will be logged out and shown the deactivated screen.')) {
      localStorage.removeItem(KEYS.loggedIn);
      hide('mainApp');
      show('deactivatedScreen');
    } else {
      // Revert toggle
      document.getElementById('activationToggle').checked = true;
      localStorage.setItem(KEYS.active, 'true');
      updateActivationStatus(true);
    }
  }
}

/** Update activation status display */
function updateActivationStatus(isActive) {
  const el = document.getElementById('activationStatus');
  if (!el) return;
  if (isActive) {
    el.textContent = '● ACTIVE';
    el.classList.remove('inactive');
  } else {
    el.textContent = '● INACTIVE';
    el.classList.add('inactive');
  }
}

/** Show reactivate prompt */
function showReactivatePrompt() {
  show('modalReactivate');
  document.getElementById('reactivatePwd').value = '';
  document.getElementById('reactivateErr').classList.add('hidden');
}

/** Process reactivation */
function doReactivate() {
  const pwd    = document.getElementById('reactivatePwd').value;
  const stored = localStorage.getItem(KEYS.password) || DEFAULT_PASSWORD;
  const errEl  = document.getElementById('reactivateErr');

  if (pwd === stored) {
    localStorage.setItem(KEYS.active, 'true');
    closeModal('modalReactivate');
    hide('deactivatedScreen');
    show('loginScreen');
    spawnParticles();
  } else {
    errEl.classList.remove('hidden');
  }
}

// ══════════════════════════════════════════════════
//  THEME
// ══════════════════════════════════════════════════

/** Toggle theme from nav button */
function toggleTheme() {
  const curr = document.documentElement.getAttribute('data-theme');
  const next = curr === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(KEYS.theme, next);
  document.getElementById('themeToggle').checked = (next === 'dark');
  showToast(next === 'dark' ? 'Dark mode activated' : 'Light mode activated');
}

/** Toggle theme from settings toggle */
function toggleThemeFromSettings() {
  const isDark = document.getElementById('themeToggle').checked;
  const theme  = isDark ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(KEYS.theme, theme);
}

/** Toggle animations */
function toggleAnimations() {
  const enabled = document.getElementById('animToggle').checked;
  if (enabled) {
    document.body.classList.remove('no-animations');
    localStorage.setItem(KEYS.animations, 'true');
  } else {
    document.body.classList.add('no-animations');
    localStorage.setItem(KEYS.animations, 'false');
  }
  showToast(enabled ? 'Animations enabled' : 'Animations disabled');
}

// ══════════════════════════════════════════════════
//  EXPORT / IMPORT
// ══════════════════════════════════════════════════

/** Export all progress as a JSON file */
function exportProgress() {
  const data = {
    exportDate:  new Date().toISOString(),
    missionName: 'TARGET26',
    progress:    getProgress(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `target26-progress-${dateKey(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Progress exported!', 'success');
}

/** Import progress from a JSON file */
function importProgress(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed.progress && typeof parsed.progress === 'object') {
        saveProgress(parsed.progress);
        refreshDashboard();
        renderCalendar();
        renderHistory('all');
        renderAnalytics();
        showToast('Progress imported!', 'success');
      } else {
        showToast('Invalid file format', 'error');
      }
    } catch {
      showToast('Failed to parse file', 'error');
    }
  };
  reader.readAsText(file);
  // Reset file input
  event.target.value = '';
}

// ══════════════════════════════════════════════════
//  CLEAR HISTORY
// ══════════════════════════════════════════════════

/** Show confirmation modal */
function confirmClearHistory() {
  show('modalClear');
}

/** Actually clear all history */
function clearHistory() {
  localStorage.removeItem(KEYS.progress);
  closeModal('modalClear');
  refreshDashboard();
  renderToday();
  renderCalendar();
  renderHistory('all');
  renderAnalytics();
  showToast('All history cleared', 'success');
}

// ══════════════════════════════════════════════════
//  PARTICLES (login background)
// ══════════════════════════════════════════════════

/** Spawn floating particles in login background */
function spawnParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  container.innerHTML = '';

  const colors = ['#00d4ff', '#00ff88', '#b44fff', '#ff8c00'];

  for (let i = 0; i < 30; i++) {
    const p  = document.createElement('div');
    p.className = 'particle';
    const size  = Math.random() * 5 + 2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left  = Math.random() * 100;
    const delay = Math.random() * 8;
    const dur   = Math.random() * 6 + 6;

    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${left}%;
      background: ${color};
      box-shadow: 0 0 ${size * 2}px ${color};
      animation-duration: ${dur}s;
      animation-delay: -${delay}s;
    `;
    container.appendChild(p);
  }
}

// ══════════════════════════════════════════════════
//  TOAST NOTIFICATIONS
// ══════════════════════════════════════════════════

let toastTimeout = null;

/** Show a toast notification */
function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className   = 'toast' + (type ? ' ' + type : '');
  toast.classList.remove('hidden');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 2500);
}

// ══════════════════════════════════════════════════
//  MODAL HELPERS
// ══════════════════════════════════════════════════

/** Close a modal by id */
function closeModal(id) {
  hide(id);
}

// Close modal when clicking overlay background
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.add('hidden');
  }
});

// ══════════════════════════════════════════════════
//  DOM HELPERS
// ══════════════════════════════════════════════════

function show(id) { document.getElementById(id).classList.remove('hidden'); }
function hide(id) { document.getElementById(id).classList.add('hidden'); }

// ══════════════════════════════════════════════════
//  BOOT
// ══════════════════════════════════════════════════

window.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
});
