/* ==========================================================
   BIT Campus Portal — front-end only mock "backend"
   Everything is stored in localStorage. No real server.
   Default data lives in database.js, loaded once below.
   ========================================================== */

const DB_KEYS = {
  users: "bit_users",
  session: "bit_session",
  news: "bit_news",
  clubs: "bit_clubs",
  activities: "bit_activities",
  activityTypes: "bit_activity_types",
  filieres: "bit_filieres",
  timetable: "bit_timetable",
  exams: "bit_exams",
};

/* ---------- Generic helpers ---------- */
function getData(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}
function setData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function getSession() {
  return JSON.parse(localStorage.getItem(DB_KEYS.session) || "null");
}
function setSession(user) {
  localStorage.setItem(DB_KEYS.session, JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem(DB_KEYS.session);
}
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
function yearLabel(n) {
  const suffixes = { 1: "1st", 2: "2nd", 3: "3rd" };
  return `${suffixes[n] || n + "th"} Year`;
}

/* ---------- Seed data from database.js (only runs once per key) ---------- */
function seed() {
  Object.entries(DATABASE).forEach(([name, items]) => {
    const key = DB_KEYS[name];
    if (key && !localStorage.getItem(key)) {
      setData(
        key,
        items.map((item) => ({ id: crypto.randomUUID(), ...item })),
      );
    }
  });
}
seed();

/* ---------- Nav rendering (runs on every page) ---------- */
function renderNav() {
  const session = getSession();
  // true when the current page lives inside /pages/ (every page except index.html)
  const inPages = /\/pages\/[^/]*$/.test(window.location.pathname);
  const homeHref = inPages ? "../index.html" : "index.html";
  const dashHref = inPages ? "dashboard.html" : "pages/dashboard.html";

  // Selecting by id (not by href) so this works the same on index.html
  // (href="pages/sign.html") and on every page inside /pages/ (href="sign.html").
  const signLink = document.getElementById("nav-auth-link");
  if (!signLink) return;

  if (session) {
    signLink.textContent = "Sign out";
    signLink.href = "#";
    signLink.addEventListener("click", (e) => {
      e.preventDefault();
      clearSession();
      window.location.href = homeHref;
    });

    const chip = document.createElement("span");
    chip.className = "user-chip";
    chip.textContent = `${session.name} · ${session.role}`;
    signLink.parentElement.insertBefore(chip, signLink);

    if (session.role === "admin") {
      const dashLink = document.createElement("a");
      dashLink.href = dashHref;
      dashLink.textContent = "Dashboard";
      signLink.parentElement.insertBefore(dashLink, signLink);
    }
  }

  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
  }
}

/* ---------- Auth (sign.html + dashboard.html guard) ---------- */
function populateAnneeOptions(selectEl, years) {
  const previous = selectEl.value;
  selectEl.innerHTML = "";
  for (let y = 1; y <= years; y++)
    selectEl.appendChild(new Option(yearLabel(y), y));
  if (previous && parseInt(previous, 10) <= years) selectEl.value = previous;
}

// Fills a filière <select> + wires it to keep a paired year <select> in sync.
function wireFiliereYearSelects(filiereSelect, anneeSelect) {
  if (!filiereSelect || !anneeSelect) return;
  const filieres = getData(DB_KEYS.filieres);
  filiereSelect.innerHTML = filieres
    .map((f) => `<option value="${f.name}">${f.name}</option>`)
    .join("");
  if (filieres.length) populateAnneeOptions(anneeSelect, filieres[0].years);
  filiereSelect.addEventListener("change", () => {
    const f = filieres.find((f) => f.name === filiereSelect.value);
    if (f) populateAnneeOptions(anneeSelect, f.years);
  });
}

function initAuthForms() {
  const roleToggle = document.getElementById("role-toggle");
  const studentFields = document.getElementById("student-only-fields");
  let currentRole = "student";

  wireFiliereYearSelects(
    document.getElementById("reg-filiere"),
    document.getElementById("reg-annee"),
  );

  if (roleToggle) {
    const roleBtns = roleToggle.querySelectorAll("button[data-role]");
    roleBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        roleBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentRole = btn.dataset.role;
        if (studentFields) {
          studentFields.style.display =
            currentRole === "student" ? "flex" : "none";
          studentFields.querySelectorAll("input, select").forEach((f) => {
            f.required = currentRole === "student";
          });
        }
      });
    });
    const params = new URLSearchParams(window.location.search);
    const wantedRole = params.get("role");
    if (wantedRole === "admin" || wantedRole === "student") {
      const target = [...roleBtns].find((b) => b.dataset.role === wantedRole);
      if (target) target.click();
    }
  } else {
    currentRole = "admin";
  }

  const loginTab = document.getElementById("tab-login");
  const registerTab = document.getElementById("tab-register");
  const loginPanel = document.getElementById("login-form");
  const registerPanel = document.getElementById("register-form");

  if (loginTab && registerTab) {
    loginTab.addEventListener("click", () => {
      loginTab.classList.add("active");
      registerTab.classList.remove("active");
      loginPanel.classList.add("active");
      registerPanel.classList.remove("active");
    });
    registerTab.addEventListener("click", () => {
      registerTab.classList.add("active");
      loginTab.classList.remove("active");
      registerPanel.classList.add("active");
      loginPanel.classList.remove("active");
    });
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "register") registerTab.click();
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document
        .getElementById("login-email")
        .value.trim()
        .toLowerCase();
      const password = document.getElementById("login-password").value;
      const msg = document.getElementById("login-msg");
      const match = getData(DB_KEYS.users).find(
        (u) => u.email.toLowerCase() === email && u.password === password,
      );
      if (!match) {
        msg.textContent = "Incorrect email or password.";
        msg.className = "form-msg error";
        return;
      }
      if (match.role !== currentRole) {
        msg.textContent = `This account is registered as ${match.role}. Switch the tab above to sign in.`;
        msg.className = "form-msg error";
        return;
      }
      setSession({ name: match.name, email: match.email, role: match.role });
      msg.textContent = "Signed in! Redirecting…";
      msg.className = "form-msg success";
      setTimeout(() => {
        window.location.href =
          match.role === "admin" ? "dashboard.html" : "../index.html";
      }, 600);
    });
  }

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = document.getElementById("register-msg");
      const firstName = document.getElementById("reg-firstname").value.trim();
      const lastName = document.getElementById("reg-lastname").value.trim();
      const email = document
        .getElementById("reg-email")
        .value.trim()
        .toLowerCase();
      const whatsapp = document.getElementById("reg-whatsapp").value.trim();
      const password = document.getElementById("reg-password").value;

      const users = getData(DB_KEYS.users);
      if (users.some((u) => u.email.toLowerCase() === email)) {
        msg.textContent = "An account with this email already exists.";
        msg.className = "form-msg error";
        return;
      }

      const newUser = {
        name: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
        email,
        whatsapp,
        password,
        role: currentRole,
      };
      if (currentRole === "student") {
        newUser.studentId = document
          .getElementById("reg-studentid")
          .value.trim();
        newUser.filiere = document.getElementById("reg-filiere").value;
        newUser.annee = parseInt(
          document.getElementById("reg-annee").value,
          10,
        );
      }

      users.push(newUser);
      setData(DB_KEYS.users, users);
      setSession({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      });
      msg.textContent = "Account created! Redirecting…";
      msg.className = "form-msg success";
      setTimeout(() => {
        window.location.href =
          currentRole === "admin" ? "dashboard.html" : "../index.html";
      }, 600);
    });
  }
}

/* ---------- Dashboard: generic list rendering with remove buttons ---------- */
function renderDashList(key, listId, template) {
  const list = document.getElementById(listId);
  if (!list) return;
  const items = getData(key);
  list.innerHTML = items.length
    ? items
        .map(
          (item) => `
        <div class="dash-item" data-id="${item.id}">
          ${template(item)}
          <button data-remove="${item.id}" data-key="${key}">Remove</button>
        </div>`,
        )
        .join("")
    : `<div class="empty-state">Nothing here yet.</div>`;

  list.querySelectorAll("button[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const items = getData(btn.dataset.key).filter(
        (i) => i.id !== btn.dataset.remove,
      );
      setData(btn.dataset.key, items);
      renderDashList(key, listId, template);
      if (btn.dataset.key === DB_KEYS.filieres) refreshFiliereDependentUI();
      if (btn.dataset.key === DB_KEYS.clubs) refreshClubSelect();
      if (btn.dataset.key === DB_KEYS.activityTypes)
        refreshActivityTypeSelect();
    });
  });
}

/* ---------- Dashboard: generic "add an entry" form ----------
   Handles the common pattern used by every dashboard form: read the
   fields, save a new entry, reset the form, re-render the list. */
function initEntryForm({
  formId,
  key,
  listId,
  prepend,
  readFields,
  template,
  onSetup,
  onAdded,
}) {
  const form = document.getElementById(formId);
  if (!form) return;
  if (onSetup) onSetup();
  renderDashList(key, listId, template);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const items = getData(key);
    const entry = { id: crypto.randomUUID(), ...readFields() };
    prepend ? items.unshift(entry) : items.push(entry);
    setData(key, items);
    form.reset();
    renderDashList(key, listId, template);
    if (onAdded) onAdded();
  });
}

function refreshClubSelect() {
  const select = document.getElementById("club-select");
  if (!select) return;
  const clubs = getData(DB_KEYS.clubs);
  select.innerHTML = clubs
    .map((c) => `<option value="${c.id}">${c.name}</option>`)
    .join("");
}

function refreshActivityTypeSelect() {
  const select = document.getElementById("activity-type");
  if (!select) return;
  const types = getData(DB_KEYS.activityTypes);
  select.innerHTML = types
    .map((t) => `<option value="${t.name}">${t.name}</option>`)
    .join("");
}

function refreshFiliereDependentUI() {
  wireFiliereYearSelects(
    document.getElementById("tt-filiere"),
    document.getElementById("tt-annee"),
  );
  wireFiliereYearSelects(
    document.getElementById("exam-filiere"),
    document.getElementById("exam-annee"),
  );
}

function initDashboard() {
  const guard = document.getElementById("dash-guard");
  if (!guard) return;

  const session = getSession();
  if (!session || session.role !== "admin") {
    guard.style.display = "flex";
    document.getElementById("dash-content").style.display = "none";
    return;
  }
  guard.style.display = "none";
  document.getElementById("dash-content").style.display = "block";

  const val = (id) => document.getElementById(id).value.trim();

  // --- News ---
  initEntryForm({
    formId: "news-form",
    key: DB_KEYS.news,
    listId: "news-list",
    prepend: true,
    readFields: () => ({
      title: val("news-title"),
      content: val("news-content"),
      date: new Date().toISOString().slice(0, 10),
    }),
    template: (item) =>
      `<div><strong>${item.title}</strong><div class="meta">${formatDate(item.date)}</div></div>`,
  });

  // --- Activities ---
  initEntryForm({
    formId: "activity-form",
    key: DB_KEYS.activities,
    listId: "activity-list",
    prepend: true,
    onSetup: refreshActivityTypeSelect,
    readFields: () => ({
      title: val("activity-title"),
      type: document.getElementById("activity-type").value,
      date: document.getElementById("activity-date").value,
      location: val("activity-location"),
      description: val("activity-description"),
    }),
    template: (item) =>
      `<div><strong>${item.title}</strong><div class="meta">${item.type} · ${formatDate(item.date)} · ${item.location}</div></div>`,
  });

  // --- Timetable sessions ---
  const daySelect = document.getElementById("tt-day");
  if (daySelect && !daySelect.options.length) {
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].forEach((d) =>
      daySelect.appendChild(new Option(d, d)),
    );
  }
  initEntryForm({
    formId: "timetable-form",
    key: DB_KEYS.timetable,
    listId: "timetable-list",
    prepend: true,
    onSetup: () =>
      wireFiliereYearSelects(
        document.getElementById("tt-filiere"),
        document.getElementById("tt-annee"),
      ),
    readFields: () => ({
      filiere: document.getElementById("tt-filiere").value,
      annee: parseInt(document.getElementById("tt-annee").value, 10),
      course: val("tt-course"),
      day: daySelect.value,
      start: document.getElementById("tt-start").value,
      end: document.getElementById("tt-end").value,
      room: val("tt-room"),
    }),
    template: (item) =>
      `<div><strong>${item.course}</strong><div class="meta">${item.filiere} · ${yearLabel(item.annee)} · ${item.day} ${item.start}–${item.end} · ${item.room}</div></div>`,
  });

  // --- Exams ---
  initEntryForm({
    formId: "exam-form",
    key: DB_KEYS.exams,
    listId: "exam-list",
    prepend: true,
    onSetup: () =>
      wireFiliereYearSelects(
        document.getElementById("exam-filiere"),
        document.getElementById("exam-annee"),
      ),
    readFields: () => ({
      filiere: document.getElementById("exam-filiere").value,
      annee: parseInt(document.getElementById("exam-annee").value, 10),
      course: val("exam-course"),
      date: document.getElementById("exam-date").value,
      time: document.getElementById("exam-time").value,
      room: val("exam-room"),
      notes: val("exam-notes"),
    }),
    template: (item) =>
      `<div><strong>${item.course}</strong><div class="meta">${item.filiere} · ${yearLabel(item.annee)} · ${formatDate(item.date)}${item.room ? " · " + item.room : ""}</div></div>`,
  });

  // --- Club weekly update (edits an existing club, doesn't add one) ---
  const clubForm = document.getElementById("club-form");
  if (clubForm) {
    refreshClubSelect();
    clubForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const clubs = getData(DB_KEYS.clubs);
      const select = document.getElementById("club-select");
      const club = clubs.find((c) => c.id === select.value);
      if (club) {
        club.update = val("club-update");
        setData(DB_KEYS.clubs, clubs);
        document.getElementById("club-msg").textContent =
          "Weekly update saved.";
        document.getElementById("club-msg").className = "form-msg success";
        clubForm.reset();
      }
    });
  }

  // --- Manage filières ---
  initEntryForm({
    formId: "filiere-form",
    key: DB_KEYS.filieres,
    listId: "filiere-list",
    readFields: () => ({
      name: val("filiere-name"),
      years: parseInt(document.getElementById("filiere-years").value, 10),
    }),
    template: (item) =>
      `<div><strong>${item.name}</strong><div class="meta">${item.years} year(s)</div></div>`,
    onAdded: refreshFiliereDependentUI,
  });

  // --- Manage clubs ---
  initEntryForm({
    formId: "club-mgmt-form",
    key: DB_KEYS.clubs,
    listId: "club-mgmt-list",
    readFields: () => ({
      name: val("club-mgmt-name"),
      description: val("club-mgmt-description"),
      update: "No update yet.",
    }),
    template: (item) =>
      `<div><strong>${item.name}</strong><div class="meta">${item.description}</div></div>`,
    onAdded: refreshClubSelect,
  });

  // --- Manage activity types ---
  initEntryForm({
    formId: "activity-type-form",
    key: DB_KEYS.activityTypes,
    listId: "activity-type-list",
    readFields: () => ({
      name: val("activity-type-name"),
      description: val("activity-type-description"),
    }),
    template: (item) =>
      `<div><strong>${item.name}</strong><div class="meta">${item.description}</div></div>`,
    onAdded: refreshActivityTypeSelect,
  });

  // --- Export data ---
  const exportBtn = document.getElementById("export-data-btn");
  if (exportBtn) exportBtn.addEventListener("click", exportDataAsCSV);
}

/* ---------- CSV export ---------- */
function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function toCsvSection(title, rows, columns) {
  const header = `## ${title}\n`;
  const cols = columns.join(",");
  const lines = rows.map((r) => columns.map((c) => csvEscape(r[c])).join(","));
  return header + cols + "\n" + lines.join("\n") + "\n";
}
const CSV_EXPORT_SECTIONS = [
  ["USERS", DB_KEYS.users, ["name", "email", "role", "filiere", "annee", "studentId", "whatsapp"]],
  ["NEWS", DB_KEYS.news, ["id", "title", "content", "date"]],
  ["CLUBS", DB_KEYS.clubs, ["id", "name", "description", "update"]],
  ["ACTIVITY_TYPES", DB_KEYS.activityTypes, ["id", "name", "description"]],
  ["ACTIVITIES", DB_KEYS.activities, ["id", "title", "type", "date", "location", "description"]],
  ["FILIERES", DB_KEYS.filieres, ["id", "name", "years"]],
  ["TIMETABLE", DB_KEYS.timetable, ["id", "filiere", "annee", "course", "day", "start", "end", "room"]],
  ["EXAMS", DB_KEYS.exams, ["id", "filiere", "annee", "course", "date", "time", "room", "notes"]],
];
function exportDataAsCSV() {
  const sections = CSV_EXPORT_SECTIONS.map(([title, key, columns]) =>
    toCsvSection(title, getData(key), columns),
  );
  const blob = new Blob([sections.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bit-data-export-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ---------- Public rendering: News ---------- */
function renderNews(containerId, limit) {
  const el = document.getElementById(containerId);
  if (!el) return;
  let items = getData(DB_KEYS.news)
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  if (limit) items = items.slice(0, limit);
  el.innerHTML = items.length
    ? items
        .map(
          (n) => `
        <div class="card">
          <div class="meta">${formatDate(n.date)}</div>
          <h3>${n.title}</h3>
          <p>${n.content}</p>
        </div>`,
        )
        .join("")
    : `<div class="empty-state">No news yet. Check back soon.</div>`;
}

/* ---------- Public rendering: simple link-cards (homepage previews) ---------- */
function renderLinkCards(containerId, items, hrefBuilder) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = items.length
    ? items
        .map(
          (i) =>
            `<a class="card link-card" href="${hrefBuilder(i.name)}">${i.name} <span>→</span></a>`,
        )
        .join("")
    : `<div class="empty-state">Nothing added yet.</div>`;
}

/* ---------- Generic: single-level tab page (Clubs, Activities) ---------- */
function initSingleTabPage(config) {
  const tabEl = document.getElementById(config.tabContainerId);
  const outEl = document.getElementById(config.outputContainerId);
  if (!tabEl || !outEl) return;

  const items = config.getItems();
  if (!items.length) {
    tabEl.innerHTML = "";
    outEl.innerHTML = `<div class="empty-state">${config.emptyLabel}</div>`;
    return;
  }

  const params = new URLSearchParams(window.location.search);
  let current = params.get(config.param) || items[0].name;
  if (!items.some((i) => i.name === current)) current = items[0].name;

  function buildTabs() {
    tabEl.innerHTML = items
      .map(
        (i) =>
          `<button type="button" class="tab-btn ${i.name === current ? "active" : ""}" data-name="${i.name}">${i.name}</button>`,
      )
      .join("");
    tabEl.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        current = btn.dataset.name;
        buildTabs();
        paint();
      });
    });
  }
  function paint() {
    config.render(outEl, current);
  }

  buildTabs();
  paint();
}

function renderClubDetail(el, name) {
  const club = getData(DB_KEYS.clubs).find((c) => c.name === name);
  if (!club) {
    el.innerHTML = `<div class="empty-state">Club not found.</div>`;
    return;
  }
  el.innerHTML = `
    <div class="card">
      <h3>${club.name}</h3>
      <p>${club.description}</p>
      <p class="meta"><strong>This week:</strong> ${club.update || "No update yet."}</p>
    </div>`;
}

function renderActivityTypeDetail(el, typeName) {
  const type = getData(DB_KEYS.activityTypes).find((t) => t.name === typeName);
  const items = getData(DB_KEYS.activities)
    .filter((a) => a.type === typeName)
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const typeDesc = type
    ? `<p class="meta" style="margin-bottom:1.2rem;">${type.description}</p>`
    : "";
  const list = items.length
    ? `<div class="grid">${items
        .map(
          (a) => `
        <div class="card">
          <span class="tag tag-${slugify(a.type)}">${a.type}</span>
          <h3>${a.title}</h3>
          <div class="meta">${formatDate(a.date)} · ${a.location}</div>
          <p>${a.description}</p>
        </div>`,
        )
        .join("")}</div>`
    : `<div class="empty-state">No ${typeName.toLowerCase()} activities scheduled yet.</div>`;
  el.innerHTML = typeDesc + list;
}

/* ---------- Generic: two-level tab page (Timetable, Exam) ---------- */
function initProgramYearTabPage(config) {
  const programEl = document.getElementById(config.programContainerId);
  const yearEl = document.getElementById(config.yearContainerId);
  const outEl = document.getElementById(config.outputContainerId);
  if (!programEl || !yearEl || !outEl) return;

  const filieres = getData(DB_KEYS.filieres);
  if (!filieres.length) {
    programEl.innerHTML = "";
    yearEl.innerHTML = "";
    outEl.innerHTML = `<div class="empty-state">No programs have been added yet.</div>`;
    return;
  }

  const params = new URLSearchParams(window.location.search);
  let currentProgram = params.get(config.programParam) || filieres[0].name;
  if (!filieres.some((f) => f.name === currentProgram))
    currentProgram = filieres[0].name;
  let currentYear = parseInt(params.get(config.yearParam), 10) || 1;

  function buildProgramTabs() {
    programEl.innerHTML = filieres
      .map(
        (f) =>
          `<button type="button" class="tab-btn ${f.name === currentProgram ? "active" : ""}" data-program="${f.name}">${f.name}</button>`,
      )
      .join("");
    programEl.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentProgram = btn.dataset.program;
        currentYear = 1;
        buildProgramTabs();
        buildYearTabs();
        paint();
      });
    });
  }
  function buildYearTabs() {
    const filiere = filieres.find((f) => f.name === currentProgram);
    const years = filiere ? filiere.years : 0;
    if (
      !Number.isInteger(currentYear) ||
      currentYear < 1 ||
      currentYear > years
    )
      currentYear = 1;
    const btns = [];
    for (let y = 1; y <= years; y++)
      btns.push(
        `<button type="button" class="tab-btn ${y === currentYear ? "active" : ""}" data-year="${y}">${yearLabel(y)}</button>`,
      );
    yearEl.innerHTML = btns.join("");
    yearEl.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentYear = parseInt(btn.dataset.year, 10);
        buildYearTabs();
        paint();
      });
    });
  }
  function paint() {
    config.render(outEl, currentProgram, currentYear);
  }

  buildProgramTabs();
  buildYearTabs();
  paint();
}

function renderTimetableSchedule(el, program, year) {
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const entries = getData(DB_KEYS.timetable).filter(
    (e) => e.filiere === program && e.annee === year,
  );
  if (!entries.length) {
    el.innerHTML = `<div class="empty-state">No sessions added yet for ${program} · ${yearLabel(year)}.</div>`;
    return;
  }
  const byDay = DAYS.map((day) => ({
    day,
    sessions: entries
      .filter((e) => e.day === day)
      .sort((a, b) => a.start.localeCompare(b.start)),
  })).filter((g) => g.sessions.length);
  el.innerHTML = byDay
    .map(
      (g) => `
    <div class="schedule-day">
      <h4>${g.day}</h4>
      ${g.sessions.map((s) => `<div class="schedule-row"><span class="time">${s.start}–${s.end}</span><span class="course">${s.course}</span><span class="room">${s.room}</span></div>`).join("")}
    </div>`,
    )
    .join("");
}

function renderExamSchedule(el, program, year) {
  const entries = getData(DB_KEYS.exams)
    .filter((e) => e.filiere === program && e.annee === year)
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  if (!entries.length) {
    el.innerHTML = `<div class="empty-state">No exams scheduled yet for ${program} · ${yearLabel(year)}.</div>`;
    return;
  }
  el.innerHTML = `<div class="grid">${entries
    .map(
      (e) => `
    <div class="card">
      <div class="meta">${formatDate(e.date)}${e.time ? " · " + e.time : ""}${e.room ? " · " + e.room : ""}</div>
      <h3>${e.course}</h3>
      ${e.notes ? `<p>${e.notes}</p>` : ""}
    </div>`,
    )
    .join("")}</div>`;
}

/* ---------- Init on load ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderNav();
  initAuthForms();
  initDashboard();

  renderNews("news-list-public", 3);
  renderNews("news-list-all");

  renderLinkCards(
    "timetable-links-public",
    getData(DB_KEYS.filieres),
    (n) => `pages/timetable.html?program=${encodeURIComponent(n)}`,
  );
  renderLinkCards(
    "exam-links-public",
    getData(DB_KEYS.filieres),
    (n) => `pages/exam.html?program=${encodeURIComponent(n)}`,
  );
  renderLinkCards(
    "clubs-links-public",
    getData(DB_KEYS.clubs),
    (n) => `pages/clubs.html?club=${encodeURIComponent(n)}`,
  );
  renderLinkCards(
    "activities-links-public",
    getData(DB_KEYS.activityTypes),
    (n) => `pages/activities.html?type=${encodeURIComponent(n)}`,
  );

  initSingleTabPage({
    tabContainerId: "club-tabs",
    outputContainerId: "club-detail",
    param: "club",
    getItems: () => getData(DB_KEYS.clubs),
    emptyLabel: "No clubs added yet.",
    render: renderClubDetail,
  });
  initSingleTabPage({
    tabContainerId: "activity-type-tabs",
    outputContainerId: "activity-detail",
    param: "type",
    getItems: () => getData(DB_KEYS.activityTypes),
    emptyLabel: "No activity types added yet.",
    render: renderActivityTypeDetail,
  });

  initProgramYearTabPage({
    programContainerId: "program-tabs",
    yearContainerId: "year-tabs",
    outputContainerId: "timetable-schedule",
    programParam: "program",
    yearParam: "annee",
    render: renderTimetableSchedule,
  });
  initProgramYearTabPage({
    programContainerId: "exam-program-tabs",
    yearContainerId: "exam-year-tabs",
    outputContainerId: "exam-schedule",
    programParam: "program",
    yearParam: "annee",
    render: renderExamSchedule,
  });
});
