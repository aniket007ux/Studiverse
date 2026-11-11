// ==================== STATE & DEFAULT DATA ====================
const defaultState = {
  username: "Scholar",
  userClass: "8",
  avatar: "🎓",
  studibits: 300,
  dailyHoursDone: 4.0,
  dailyHoursTarget: 6.0,
  weeklyHoursDone: 27.0,
  weeklyHoursTarget: 54.0,
  theme: "dark",
  notifications: true,
  showAllBadges: false,
  homeTasks: [
    { id: 1, title: "Quiz of Topic/Subject", done: true, pts: 25 },
    { id: 2, title: "Question on Topic/Subject", done: true, pts: 25 },
    { id: 3, title: "Sample Paper Practice", done: false, pts: 30 },
    { id: 4, title: "Video on Selected Topic", done: false, pts: 20 }
  ],
  scheduleTasks: [
    { id: 101, title: "SST and Math Session (+2 hrs)", hours: 2.0, done: true, pts: 40 },
    { id: 102, title: "Diary completion (+1 hrs)", hours: 1.0, done: true, pts: 20 },
    { id: 103, title: "Break (walking on garden) 30m", hours: 0.5, done: true, pts: 10 },
    { id: 104, title: "Revise Session (+1.5 hrs)", hours: 1.5, done: false, pts: 30 },
    { id: 105, title: "Tuition (+1.5 hrs)", hours: 1.5, done: false, pts: 30 }
  ],
  calendarEvents: [
    { day: 14, title: "Children's Day (Festival)", type: "festival" },
    { day: 15, title: "Guru Nanak Jayanti", type: "festival" },
    { day: 18, title: "PT-2 Test", type: "exam" },
    { day: 21, title: "MATH Class Test", type: "exam" },
    { day: 22, title: "SST Ch-3 Test", type: "exam" }
  ],
  weeklyDailyHours: [3.5, 4.5, 4.0, 5.0, 3.5, 2.5, 4.0]
};

let appState = JSON.parse(localStorage.getItem("studiverse_state")) || defaultState;

function saveState() {
  localStorage.setItem("studiverse_state", JSON.stringify(appState));
}

// ==================== QUOTES & GREETING ENGINE ====================
const quotes = [
  '"Success is the sum of small efforts, repeated day in and day out."',
  '"Discipline is choosing between what you want now and what you want most."',
  '"Don\'t watch the clock; do what it does. Keep going!"',
  '"The expert in anything was once a beginner. Stay focused!"',
  '"Push yourself, because no one else is going to do it for you."'
];
let quoteIdx = 0;

function updateGreetingAndClock() {
  const now = new Date();
  const hr = now.getHours();
  let greet = "Good Morning";
  if (hr >= 12 && hr < 17) greet = "Good Afternoon";
  else if (hr >= 17) greet = "Good Evening";

  document.getElementById("greetingHeader").textContent = `${greet}, ${appState.username}!`;
  document.getElementById("liveClockText").textContent =
    `🕒 ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Class ${appState.userClass}`;

  // Show nearest upcoming exam in header alert chip
  const todayDate = now.getDate();
  const upcoming = appState.calendarEvents
    .filter(e => e.type === "exam" && e.day >= todayDate)
    .sort((a, b) => a.day - b.day)[0] || appState.calendarEvents[0];

  if (upcoming) {
    const diff = upcoming.day - todayDate;
    const diffLabel = diff >= 0 ? `${diff} days left` : `Day ${upcoming.day}`;
    document.getElementById("homeEventAlert").textContent =
      `🔔 Upcoming Event: ${upcoming.day} Nov - ${upcoming.title} (${diffLabel})`;
  }
}

function rotateQuote() {
  quoteIdx = (quoteIdx + 1) % quotes.length;
  document.getElementById("motivationalQuote").textContent = quotes[quoteIdx];
}

// ==================== NAVIGATION ====================
function switchView(viewName) {
  document.querySelectorAll(".view-section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));

  document.getElementById(`view-${viewName}`).classList.add("active");
  const navBtn = document.getElementById(`nav-${viewName}`);
  if (navBtn) navBtn.classList.add("active");
}

// ==================== HOME PROGRESS & TASKS ====================
function renderHome() {
  updateGreetingAndClock();
  document.getElementById("topStudibits").textContent = appState.studibits;

  // Calculate progress percentage
  const pct = Math.min(100, Math.round((appState.dailyHoursDone / appState.dailyHoursTarget) * 100));
  const circumference = 339.292;
  const offset = circumference - (pct / 100) * circumference;

  document.getElementById("progressRingCircle").style.strokeDashoffset = offset;
  document.getElementById("ringHoursText").textContent =
    `${appState.dailyHoursDone.toFixed(1)}h/${appState.dailyHoursTarget}h`;
  document.getElementById("ringPctText").textContent = `${pct}% DONE`;

  const doneCount = appState.homeTasks.filter(t => t.done).length;
  document.getElementById("homeTasksStat").textContent = `${doneCount} / ${appState.homeTasks.length}`;

  // Render Today's Tasks checklist
  const listEl = document.getElementById("homeTaskList");
  listEl.innerHTML = "";
  appState.homeTasks.forEach(task => {
    const item = document.createElement("div");
    item.className = `task-item ${task.done ? "done" : ""}`;
    item.onclick = () => toggleHomeTask(task.id);
    item.innerHTML = `
      <div class="task-left">
        <input type="checkbox" class="task-checkbox" ${task.done ? "checked" : ""} onclick="event.stopPropagation(); toggleHomeTask(${task.id})" />
        <span class="task-title">${task.title}</span>
      </div>
      <span class="task-badge">+${task.pts} pts</span>
    `;
    listEl.appendChild(item);
  });
}

function toggleHomeTask(id) {
  const task = appState.homeTasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  if (task.done) {
    appState.studibits += task.pts;
    appState.dailyHoursDone = Math.min(appState.dailyHoursTarget, appState.dailyHoursDone + 0.5);
    appState.weeklyHoursDone = Math.min(appState.weeklyHoursTarget, appState.weeklyHoursDone + 0.5);
  } else {
    appState.studibits = Math.max(0, appState.studibits - task.pts);
    appState.dailyHoursDone = Math.max(0, appState.dailyHoursDone - 0.5);
    appState.weeklyHoursDone = Math.max(0, appState.weeklyHoursDone - 0.5);
  }
  saveState();
  renderAll();
}

// ==================== TOPIC VIDEOS, AI QUIZ & ANSWER IMPROVER ====================
function updateTopicContent() {
  const rawTopic = document.getElementById("topicInput").value.trim() || "Your Selected Topic";
  const videoList = document.getElementById("videoCardList");

  const lessons = [
    {
      title: `Concept Masterclass: ${rawTopic}`,
      sub: `Class ${appState.userClass} NCERT & Olympiad Visual Breakdown • 12:40`,
      mode: "Fundamentals"
    },
    {
      title: `Top 10 Exam Questions on ${rawTopic}`,
      sub: `Step-by-step board & district level problem solving • 18:15`,
      mode: "Exam Prep"
    },
    {
      title: `One-Shot Rapid Revision: ${rawTopic}`,
      sub: `Mind-map, formulas & memory tricks • 09:50`,
      mode: "Quick Recap"
    }
  ];

  videoList.innerHTML = lessons.map(v => `
    <div class="video-card" onclick="playSimulatedVideo('${rawTopic.replace(/'/g, "")}', '${v.mode}')">
      <div class="video-thumb">▶</div>
      <div class="video-info">
        <h4>${v.title}</h4>
        <p>${v.sub}</p>
      </div>
    </div>
  `).join("");
}

function playSimulatedVideo(topic, mode) {
  alert(`🎬 Playing "${mode}" Video Lesson on: ${topic}\n\n(+15 Studibits awarded for active video learning!)`);
  appState.studibits += 15;
  saveState();
  renderAll();
}

function generateAIQuiz() {
  const topic = document.getElementById("topicInput").value.trim() || "General Science & Math";
  const quizBox = document.getElementById("quizContainer");

  const questionBank = [
    {
      q: `Q1. In the context of "${topic}" (Class ${appState.userClass}), which strategy ensures maximum conceptual retention and exam accuracy?`,
      options: [
        "Applying core principles, unit verification, and structured diagrams",
        "Memorizing without understanding definitions",
        "Skipping numerical derivations entirely",
        "Writing unformatted single-word points"
      ],
      correct: 0,
      explain: "Correct! District and board examiners reward principle-based steps, units, and labeled diagrams."
    },
    {
      q: `Q2. Which scientific law or analytical method is most directly tested in "${topic}" application problems?`,
      options: [
        "Conservation & proportional cause-effect relationships",
        "Random trial-and-error guessing",
        "Ignoring boundary conditions",
        "None of the above"
      ],
      correct: 0,
      explain: "Spot on! Cause-effect proportionality and conservation laws form the backbone of high-level questions."
    }
  ];

  const pick = questionBank[Math.floor(Math.random() * questionBank.length)];

  quizBox.innerHTML = `
    <div style="font-weight:700; font-size:0.9rem; margin-bottom:8px;">${pick.q}</div>
    ${pick.options.map((opt, i) => `
      <button class="quiz-option" onclick="checkQuizOption(this, ${i === pick.correct}, '${pick.explain.replace(/'/g, "\\'")}')">
        ${String.fromCharCode(65 + i)}. ${opt}
      </button>
    `).join("")}
    <div id="quizResultMsg" style="margin-top:8px; font-size:0.8rem; font-weight:600;"></div>
  `;
}

function checkQuizOption(btn, isCorrect, explain) {
  const parent = btn.parentElement;
  parent.querySelectorAll(".quiz-option").forEach(b => b.disabled = true);
  const msg = document.getElementById("quizResultMsg");

  if (isCorrect) {
    btn.classList.add("correct");
    msg.style.color = "var(--success)";
    msg.textContent = `✅ ${explain} (+30 Studibits!)`;
    appState.studibits += 30;
    saveState();
    renderAll();
  } else {
    btn.classList.add("wrong");
    msg.style.color = "var(--danger)";
    msg.textContent = `❌ Not quite! ${explain}`;
  }
}

function evaluateAnswerWriting() {
  const topic = document.getElementById("topicInput").value.trim() || "this topic";
  const ans = document.getElementById("studentAnswerInput").value.trim();
  const out = document.getElementById("answerFeedbackBox");
  out.classList.remove("hidden-box");

  if (ans.length < 15) {
    out.innerHTML = `<span class="warning-text">⚠️ Please write at least 1-2 complete sentences so the AI evaluator can grade your answer structure.</span>`;
    return;
  }

  const words = ans.split(/\s+/).length;
  const hasKeywords = /because|therefore|defined|process|example|formula|function|result/i.test(ans);
  const score = Math.min(5, (words >= 20 ? 3 : 2) + (hasKeywords ? 2 : 1));

  out.innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
      <strong>📊 AI Evaluation Score: ${score} / 5 Marks</strong>
      <span class="success-hint" style="font-weight:700;">+20 Studibits</span>
    </div>
    <p class="card-helper-text">
      • <strong>Word Count:</strong> ${words} words (${words < 25 ? "Add 1-2 more supporting points" : "Ideal length"})<br/>
      • <strong>Connector Terms:</strong> ${hasKeywords ? "Good analytical flow detected" : "Include connectors like 'therefore', 'for example', or 'consequently'"}
    </p>
    <div style="background:var(--bg-card); padding:10px; border-radius:8px; font-size:0.8rem; border-left:3px solid var(--accent-2);">
      <strong>✨ AI Topper Model Upgrade (${topic}):</strong><br/>
      "<strong>Definition:</strong> ${ans.charAt(0).toUpperCase() + ans.slice(1)}<br/>
      <strong>Key Mechanism / Point:</strong> Furthermore, this principle operates systematically under standard conditions.<br/>
      <strong>Conclusion / Application:</strong> Therefore, mastering ${topic} is essential for solving practical real-world applications."
    </div>
  `;
  appState.studibits += 20;
  saveState();
  renderAll();
}

// ==================== SCHEDULE & INTERACTIVE CALENDAR ====================
function renderSchedule() {
  const calGrid = document.getElementById("calendarGrid");
  calGrid.innerHTML = "";
  const today = new Date().getDate();

  for (let d = 1; d <= 30; d++) {
    const ev = appState.calendarEvents.find(e => e.day === d);
    const cell = document.createElement("div");
    cell.className = "cal-day";
    if (d === today) cell.classList.add("today");
    if (ev && ev.type === "exam") cell.classList.add("has-exam");
    if (ev && ev.type === "festival") cell.classList.add("has-festival");
    cell.textContent = d;
    cell.onclick = () => showDayCountdown(d);
    calGrid.appendChild(cell);
  }

  // Render Side Events List
  const sideEl = document.getElementById("calendarSideEvents");
  sideEl.innerHTML = appState.calendarEvents
    .sort((a, b) => a.day - b.day)
    .map(ev => `
      <div class="side-event-item ${ev.type === "festival" ? "festival" : ""}" onclick="showDayCountdown(${ev.day})">
        <strong>${ev.day} Nov:</strong> ${ev.title}
      </div>
    `).join("");

  // Render Schedule Tasks
  const sList = document.getElementById("scheduleTaskList");
  sList.innerHTML = "";
  appState.scheduleTasks.forEach(item => {
    const row = document.createElement("div");
    row.className = `task-item ${item.done ? "done" : ""}`;
    row.onclick = () => toggleScheduleTask(item.id);
    row.innerHTML = `
      <div class="task-left">
        <input type="checkbox" class="task-checkbox" ${item.done ? "checked" : ""} onclick="event.stopPropagation(); toggleScheduleTask(${item.id})" />
        <span class="task-title">${item.title}</span>
      </div>
      <span class="task-badge">+${item.pts} pts</span>
    `;
    sList.appendChild(row);
  });
}

function showDayCountdown(dayNum) {
  const today = new Date().getDate();
  const diff = dayNum - today;
  const ev = appState.calendarEvents.find(e => e.day === dayNum);
  const label = ev ? ev.title : `Selected Date (Nov ${dayNum})`;
  const status = diff > 0
    ? `⏳ <strong>${diff} day(s) left</strong> until ${label}!`
    : diff === 0
    ? `🚨 <strong>Today</strong> is ${label}!`
    : `✅ ${label} was ${Math.abs(diff)} day(s) ago.`;

  document.getElementById("eventCountdownBanner").innerHTML = `<span>${status}</span>`;
}

function toggleScheduleTask(id) {
  const item = appState.scheduleTasks.find(t => t.id === id);
  if (!item) return;
  item.done = !item.done;
  if (item.done) {
    appState.studibits += item.pts;
    appState.dailyHoursDone = Math.min(appState.dailyHoursTarget, appState.dailyHoursDone + item.hours);
    appState.weeklyHoursDone = Math.min(appState.weeklyHoursTarget, appState.weeklyHoursDone + item.hours);
  } else {
    appState.studibits = Math.max(0, appState.studibits - item.pts);
    appState.dailyHoursDone = Math.max(0, appState.dailyHoursDone - item.hours);
    appState.weeklyHoursDone = Math.max(0, appState.weeklyHoursDone - item.hours);
  }
  saveState();
  renderAll();
}

// ==================== TIMER & 60HZ WEB AUDIO ENGINE ====================
let timerMode = "stopwatch"; // 'stopwatch' | 'timer' | 'focus'
let timerRunning = false;
let timerSeconds = 0;
let timerInterval = null;

// Web Audio API 60Hz neural sound generator
let audioCtx = null;
let osc60Hz = null;
let gainNode = null;
let isFocusMusicPlaying = false;

function switchTimerMode(mode) {
  pauseTimerClock();
  timerMode = mode;
  document.querySelectorAll(".mode-tab").forEach(t => t.classList.remove("active"));
  document.getElementById(`tab-${mode}`).classList.add("active");

  const picker = document.getElementById("timerDurationPicker");
  if (mode === "stopwatch") {
    picker.classList.add("hidden-box");
    timerSeconds = 0;
    document.getElementById("timerStatusSub").textContent = "Stopwatch Mode Ready";
  } else {
    picker.classList.remove("hidden-box");
    const mins = parseInt(document.getElementById("customMinutesInput").value) || 25;
    timerSeconds = mins * 60;
    document.getElementById("timerStatusSub").textContent =
      mode === "focus" ? "Focus Mode (Auto 60Hz Sound Enabled)" : "Countdown Timer Ready";
    if (mode === "focus" && !isFocusMusicPlaying) {
      toggleFocusMusic(true);
    }
  }
  updateTimerDisplay();
}

function updateCustomTimerMinutes() {
  if (timerMode !== "stopwatch") {
    const mins = Math.max(1, parseInt(document.getElementById("customMinutesInput").value) || 25);
    timerSeconds = mins * 60;
    updateTimerDisplay();
  }
}

function updateTimerDisplay() {
  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  document.getElementById("timerDisplay").textContent =
    `${mins}:${secs < 10 ? "0" : ""}${secs}s`;
}

function toggleTimerRun() {
  if (timerRunning) {
    pauseTimerClock();
  } else {
    timerRunning = true;
    document.getElementById("timerPlayBtn").textContent = "⏸";
    if (timerMode === "focus" && !isFocusMusicPlaying) {
      toggleFocusMusic(true);
    }
    timerInterval = setInterval(() => {
      if (timerMode === "stopwatch") {
        timerSeconds++;
      } else {
        if (timerSeconds > 0) {
          timerSeconds--;
        } else {
          pauseTimerClock();
          appState.studibits += 50;
          saveState();
          renderAll();
          alert("🎉 Study Session Complete! You earned +50 Studibits!");
        }
      }
      updateTimerDisplay();
    }, 1000);
  }
}

function pauseTimerClock() {
  timerRunning = false;
  clearInterval(timerInterval);
  document.getElementById("timerPlayBtn").textContent = "▶";
}

function resetTimerClock() {
  pauseTimerClock();
  if (timerMode === "stopwatch") {
    timerSeconds = 0;
  } else {
    const mins = parseInt(document.getElementById("customMinutesInput").value) || 25;
    timerSeconds = mins * 60;
  }
  updateTimerDisplay();
}

function toggleFocusMusic(forceOn = false) {
  const btn = document.getElementById("focusMusicToggleBtn");
  if (isFocusMusicPlaying && !forceOn) {
    if (osc60Hz) {
      osc60Hz.stop();
      osc60Hz.disconnect();
      osc60Hz = null;
    }
    isFocusMusicPlaying = false;
    btn.textContent = "▶ Play 60Hz";
    return;
  }

  if (!isFocusMusicPlaying) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx) audioCtx = new AudioContextClass();
    osc60Hz = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();

    osc60Hz.type = "sine";
    osc60Hz.frequency.setValueAtTime(60, audioCtx.currentTime); // Authentic 60Hz Focus Frequency
    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);

    osc60Hz.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc60Hz.start();

    isFocusMusicPlaying = true;
    btn.textContent = "⏹ Stop 60Hz";
  }
}

function handleMP3Upload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const player = document.getElementById("customAudioPlayer");
  player.src = url;
  player.classList.remove("hidden-box");
  player.play();
  document.getElementById("uploadedFileName").textContent = `🎵 Playing Local Track: ${file.name}`;
}

function startDesignatedSession(mins) {
  document.getElementById("customMinutesInput").value = mins;
  switchTimerMode("focus");
  toggleTimerRun();
}

function launchFocusQuick() {
  switchView("timer");
  startDesignatedSession(25);
}

// ==================== PROFILE & BADGES ====================
const allBadges = [
  { name: "First Step", icon: "🌱", req: 100 },
  { name: "Writer", icon: "✍️", req: 200 },
  { name: "Flash", icon: "⚡", req: 250 },
  { name: "On Time", icon: "⏰", req: 300 },
  { name: "Quiz Pro", icon: "🧠", req: 350 },
  { name: "60Hz Zen", icon: "🎧", req: 400 },
  { name: "Topper", icon: "👑", req: 500 },
  { name: "Olympiad", icon: "🚀", req: 600 }
];

function getRankTitle(pts) {
  if (pts >= 500) return "Grandmaster lvl-5";
  if (pts >= 400) return "Scholar lvl-4";
  if (pts >= 350) return "Scholar lvl-3";
  if (pts >= 250) return "Scholar lvl-2";
  return "Scholar lvl-1";
}

function renderProfile() {
  document.getElementById("profileAvatarEmoji").textContent = appState.avatar;
  document.getElementById("profileHelloText").textContent = `Hello ${appState.username}...`;
  document.getElementById("profileUsername").textContent = appState.username;
  document.getElementById("profileClassBadge").textContent = `Class - ${appState.userClass}`;
  document.getElementById("classSelectDropdown").value = appState.userClass;

  const wkPct = Math.min(100, Math.round((appState.weeklyHoursDone / appState.weeklyHoursTarget) * 100));
  document.getElementById("weeklyHoursLabel").textContent =
    `${appState.weeklyHoursDone.toFixed(1)}h / ${appState.weeklyHoursTarget}h (${wkPct}%)`;
  document.getElementById("weeklyBarFill").style.width = `${wkPct}%`;

  const rank = getRankTitle(appState.studibits);
  document.getElementById("profileRankText").textContent = rank;
  document.getElementById("rankMiniBadge").textContent = rank;
  document.getElementById("profileScoreText").textContent = `${appState.studibits} Studibits`;

  // Render 7-Day Study Analytics Chart
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const chartEl = document.getElementById("weeklyChartBars");
  chartEl.innerHTML = appState.weeklyDailyHours.map((h, i) => {
    const heightPct = Math.min(100, Math.round((h / 6) * 100));
    return `
      <div class="chart-col">
        <div class="chart-bar" style="height:${heightPct}px;" title="${h} hrs"></div>
        <span class="chart-label">${days[i]}</span>
      </div>
    `;
  }).join("");

  // Render Badges
  const visibleBadges = appState.showAllBadges ? allBadges : allBadges.slice(0, 4);
  document.getElementById("badgesGrid").innerHTML = visibleBadges.map(b => {
    const unlocked = appState.studibits >= b.req;
    return `
      <div class="badge-item ${unlocked ? "" : "locked"}">
        <span class="badge-icon">${b.icon}</span>
        <span>${b.name}</span>
      </div>
    `;
  }).join("");
}

function toggleMoreBadges() {
  appState.showAllBadges = !appState.showAllBadges;
  document.getElementById("seeMoreBadgesBtn").textContent =
    appState.showAllBadges ? "Show Less" : "See More";
  renderProfile();
}

function changeAvatarEmoji() {
  const emojis = ["🎓", "🚀", "⚡", "🦁", "🏆", "🔬", "💻"];
  const next = emojis[(emojis.indexOf(appState.avatar) + 1) % emojis.length];
  appState.avatar = next;
  saveState();
  renderProfile();
}

// ==================== MODALS & SETTINGS ACTIONS ====================
function openModal(id) {
  document.getElementById(id).classList.add("open");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

function saveNewItem() {
  const type = document.getElementById("newItemType").value;
  const title = document.getElementById("newItemTitle").value.trim();
  const hours = parseFloat(document.getElementById("newItemHours").value) || 1.0;
  const day = Math.min(30, Math.max(1, parseInt(document.getElementById("newItemDate").value) || 25));

  if (!title) {
    alert("Please enter a title!");
    return;
  }

  if (type === "homeTask") {
    appState.homeTasks.push({ id: Date.now(), title, done: false, pts: 25 });
  } else if (type === "scheduleTask") {
    appState.scheduleTasks.push({
      id: Date.now(),
      title: `${title} (+${hours} hrs)`,
      hours,
      done: false,
      pts: Math.round(hours * 20)
    });
  } else if (type === "examEvent") {
    appState.calendarEvents.push({ day, title, type: "exam" });
  }

  document.getElementById("newItemTitle").value = "";
  saveState();
  renderAll();
  closeModal("addModal");
}

function toggleTheme() {
  appState.theme = appState.theme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", appState.theme);
  document.getElementById("themeToggleBtn").textContent =
    appState.theme === "dark" ? "Dark Mode" : "Light Mode";
  saveState();
}

function toggleNotifications() {
  appState.notifications = document.getElementById("notifToggle").checked;
  saveState();
}

function changeUserClass(val) {
  appState.userClass = val;
  saveState();
  renderAll();
}

function promptChangeProfileName() {
  const name = prompt("Enter your Username:", appState.username);
  if (name && name.trim()) {
    appState.username = name.trim();
    saveState();
    renderAll();
  }
}

function clearAppCache() {
  document.getElementById("loginInfoText").textContent =
    "Account ID: STU-2026-X8 • Status: Cache Cleared (0.0 KB) ✅";
  alert("🧹 Temporary cache cleared successfully! Your progress and Studibits are safe.");
}

function switchOrSignOutAccount() {
  const newUser = prompt("Switch Account — Enter Username for session:", "Scholar_2");
  if (newUser && newUser.trim()) {
    appState.username = newUser.trim();
    saveState();
    renderAll();
    closeModal("settingsModal");
  }
}

function resetAllAppData() {
  if (confirm("Reset all tasks, schedule events, and Studibits back to default?")) {
    localStorage.removeItem("studiverse_state");
    appState = JSON.parse(JSON.stringify(defaultState));
    renderAll();
    closeModal("settingsModal");
  }
}

function renderAll() {
  document.documentElement.setAttribute("data-theme", appState.theme);
  renderHome();
  renderSchedule();
  renderProfile();
}

// Initialize App on Load
window.addEventListener("DOMContentLoaded", () => {
  renderAll();
  updateTopicContent();
  setInterval(updateGreetingAndClock, 30000);
});