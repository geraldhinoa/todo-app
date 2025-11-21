// ===== Storage keys & DOM =====
const STORAGE_KEY = "todo_pro_tasks_v1";
const THEME_KEY = "todo_pro_theme_v1";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const emojiSelect = document.getElementById("emojiSelect");
const taskList = document.getElementById("taskList");
const totalCount = document.getElementById("totalCount");
const doneCount = document.getElementById("doneCount");
const leftCount = document.getElementById("leftCount");
const clearDoneBtn = document.getElementById("clearDone");
const clearAllBtn = document.getElementById("clearAll");
const themeToggle = document.getElementById("themeToggle");
const soundToggle = document.getElementById("soundToggle");

const motivModal = document.getElementById("motivModal");
const motivText = document.getElementById("motivText");
const closeMotiv = document.getElementById("closeMotiv");

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// Motivasi list
const motivasi = [
  "Ayo, satu tugas kecil hari ini = satu langkah lebih dekat!",
  "Kerjakan dulu, rebahan nanti. Kamu bisa!",
  "Sedikit usaha sekarang, santai nanti.",
  "Ingat targetmu — jangan bilang nanti!",
  "Selesaikan satu, rasa lega pulang gratis.",
];

// ===== Theme (dark / light) =====
function applyTheme(theme) {
  if (theme === "dark")
    document.documentElement.setAttribute("data-theme", "dark");
  else document.documentElement.removeAttribute("data-theme");
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem(THEME_KEY, theme);
}
const savedTheme =
  localStorage.getItem(THEME_KEY) ||
  (window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light");
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const current =
    document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light";
  applyTheme(current === "dark" ? "light" : "dark");
});

// ===== Audio click using WebAudio (small beep) =====
function playBeep() {
  if (!soundToggle.checked) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 560;
    g.gain.value = 0.03;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => {
      o.stop();
      ctx.close();
    }, 90);
  } catch (e) {
    /* ignore on older browsers */
  }
}

// ===== Save / Load =====
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
function addTask(text, emoji) {
  const newTask = { id: Date.now(), text, emoji, done: false };
  tasks.unshift(newTask); // newest on top
  saveTasks();
  render();
  playBeep();
}
function removeTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}
function toggleDone(id) {
  tasks = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  saveTasks();
  render();
  playBeep();
}

// ===== Rendering =====
function render() {
  taskList.innerHTML = "";
  tasks.forEach((t) => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.id = t.id;

    const left = document.createElement("div");
    left.className = "task-left";
    const emoji = document.createElement("div");
    emoji.className = "task-emoji";
    emoji.textContent = t.emoji || "📝";
    const text = document.createElement("div");
    text.className = "task-text";
    text.textContent = t.text;
    if (t.done) text.classList.add("done");

    left.appendChild(emoji);
    left.appendChild(text);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    // done button
    const btnDone = document.createElement("button");
    btnDone.className = "btn-done";
    btnDone.title = "Selesai";
    btnDone.textContent = "✔";
    btnDone.onclick = () => toggleDone(t.id);

    // kerjakan nanti (motivasi)
    const btnLater = document.createElement("button");
    btnLater.className = "btn-later";
    btnLater.title = "Kerjakan nanti";
    btnLater.textContent = "🕒";
    btnLater.onclick = () => showMotivation();

    // delete
    const btnDel = document.createElement("button");
    btnDel.className = "btn-delete";
    btnDel.title = "Hapus";
    btnDel.textContent = "🗑";
    btnDel.onclick = () => {
      if (confirm("Hapus tugas ini?")) {
        removeTask(t.id);
      }
    };

    actions.appendChild(btnDone);
    actions.appendChild(btnLater);
    actions.appendChild(btnDel);

    li.appendChild(left);
    li.appendChild(actions);
    taskList.appendChild(li);
  });

  // stats
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  totalCount.textContent = total;
  doneCount.textContent = done;
  leftCount.textContent = total - done;
}

// ===== Motivation modal =====
function showMotivation() {
  motivText.textContent = motivasi[Math.floor(Math.random() * motivasi.length)];
  motivModal.classList.remove("hidden");
  motivModal.setAttribute("aria-hidden", "false");
  playBeep();
}
closeMotiv.addEventListener("click", () => {
  motivModal.classList.add("hidden");
  motivModal.setAttribute("aria-hidden", "true");
});

// ===== Form submit =====
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  const emoji = emojiSelect.value || "📝";
  if (!text) return;
  addTask(text, emoji);
  taskInput.value = "";
  taskInput.focus();
});

// ===== Footer actions =====
clearDoneBtn.addEventListener("click", () => {
  if (!confirm("Hapus semua tugas yang sudah selesai?")) return;
  tasks = tasks.filter((t) => !t.done);
  saveTasks();
  render();
});
clearAllBtn.addEventListener("click", () => {
  if (!confirm("Hapus SEMUA tugas (tidak dapat dikembalikan)?")) return;
  tasks = [];
  saveTasks();
  render();
});

// ===== Init =====
render();

// Optional: keyboard shortcut (Enter when typing in input already handled by submit)
// Bonus: handle double-click on task to toggle done quickly
taskList.addEventListener("dblclick", (e) => {
  const li = e.target.closest(".task-item");
  if (!li) return;
  const id = +li.dataset.id;
  toggleDone(id);
});
