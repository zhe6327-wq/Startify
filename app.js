const STORAGE_KEY = "startify-local-data-v1";

const STATE_OPTIONS = [
  {
    key: "anxious",
    label: "我很焦虑",
    hint: "先做门槛低、动作明确的事",
    desc: "先缩小动作范围，让开始这件事轻一点。"
  },
  {
    key: "blank",
    label: "脑子空白",
    hint: "先激活思路，再往下走",
    desc: "适合步骤明确、不需要太多思考准备的任务。"
  },
  {
    key: "tired",
    label: "我很累",
    hint: "先做低能量的小任务",
    desc: "短时长、低消耗优先，先把状态拉起来。"
  },
  {
    key: "ten_min",
    label: "只剩 10 分钟",
    hint: "只看超短任务",
    desc: "这时候先推进一点，比完整规划更重要。"
  }
];

const CATEGORY_LABELS = {
  all: "全部",
  study: "学习",
  work: "工作",
  life: "生活",
  general: "其他"
};

const DEFAULT_TASKS = [
  {
    id: "seed-open-doc",
    title: "打开作业文档",
    category: "study",
    durationMin: 3,
    energyLevel: 1,
    favorite: true,
    source: "seed",
    tags: ["clear-step", "no-prep"],
    recommendedFor: ["anxious", "blank"],
    playCount: 0,
    completedCount: 0,
    archived: false,
    createdAt: nowISO(),
    updatedAt: nowISO()
  },
  {
    id: "seed-outline",
    title: "写一句提纲",
    category: "work",
    durationMin: 5,
    energyLevel: 1,
    favorite: true,
    source: "seed",
    tags: ["clear-step"],
    recommendedFor: ["anxious", "ten_min"],
    playCount: 0,
    completedCount: 0,
    archived: false,
    createdAt: nowISO(),
    updatedAt: nowISO()
  },
  {
    id: "seed-water",
    title: "喝一口水",
    category: "life",
    durationMin: 2,
    energyLevel: 1,
    favorite: false,
    source: "seed",
    tags: ["quick", "reset", "no-prep"],
    recommendedFor: ["tired", "anxious"],
    playCount: 0,
    completedCount: 0,
    archived: false,
    createdAt: nowISO(),
    updatedAt: nowISO()
  },
  {
    id: "seed-clean-desk",
    title: "整理桌面 5 分钟",
    category: "life",
    durationMin: 5,
    energyLevel: 2,
    favorite: false,
    source: "seed",
    tags: ["reset", "clear-step"],
    recommendedFor: ["blank", "tired"],
    playCount: 0,
    completedCount: 0,
    archived: false,
    createdAt: nowISO(),
    updatedAt: nowISO()
  },
  {
    id: "seed-review-note",
    title: "复习一个知识点",
    category: "study",
    durationMin: 10,
    energyLevel: 2,
    favorite: false,
    source: "seed",
    tags: ["focus"],
    recommendedFor: ["blank", "ten_min"],
    playCount: 0,
    completedCount: 0,
    archived: false,
    createdAt: nowISO(),
    updatedAt: nowISO()
  },
  {
    id: "seed-stand-up",
    title: "站起来活动一下",
    category: "life",
    durationMin: 4,
    energyLevel: 1,
    favorite: false,
    source: "seed",
    tags: ["body", "reset", "no-prep"],
    recommendedFor: ["tired", "blank"],
    playCount: 0,
    completedCount: 0,
    archived: false,
    createdAt: nowISO(),
    updatedAt: nowISO()
  }
];

const appState = {
  tasks: [],
  recommendations: [],
  sessions: [],
  currentScreen: "player",
  selectedState: "anxious",
  selectedTaskId: null,
  listFilter: "all",
  search: "",
  activeSessionId: null,
  timerTotalSec: 120,
  timerRemainingSec: 120,
  timerRunning: false,
  timerIntervalId: null,
  lastTickAt: null,
  createStates: ["anxious"],
  aiSuggestion: null
};

const elements = {
  healthPill: document.getElementById("health-pill"),
  apiTip: document.getElementById("api-tip"),
  todayStarted: document.getElementById("today-started"),
  todayCompleted: document.getElementById("today-completed"),
  refreshBtn: document.getElementById("refresh-app"),
  navButtons: [...document.querySelectorAll(".nav-btn")],
  screens: [...document.querySelectorAll(".screen")],
  currentTitle: document.getElementById("current-title"),
  currentCategory: document.getElementById("current-category"),
  currentSummary: document.getElementById("current-summary"),
  currentDuration: document.getElementById("current-duration"),
  currentEnergy: document.getElementById("current-energy"),
  currentState: document.getElementById("current-state"),
  prepareChip: document.getElementById("prepare-chip"),
  favoriteCurrent: document.getElementById("favorite-current"),
  timerText: document.getElementById("timer-text"),
  timerCaption: document.getElementById("timer-caption"),
  startToggle: document.getElementById("start-toggle"),
  completeTask: document.getElementById("complete-task"),
  skipTask: document.getElementById("skip-task"),
  nextTitle: document.getElementById("next-title"),
  nextSummary: document.getElementById("next-summary"),
  nextTags: document.getElementById("next-tags"),
  useNextTask: document.getElementById("use-next-task"),
  stateGrid: document.getElementById("state-grid"),
  launchStateTitle: document.getElementById("launch-state-title"),
  launchStateChip: document.getElementById("launch-state-chip"),
  launchStateCopy: document.getElementById("launch-state-copy"),
  recommendationList: document.getElementById("recommendation-list"),
  taskSearch: document.getElementById("task-search"),
  categoryFilters: document.getElementById("category-filters"),
  taskList: document.getElementById("task-list"),
  createForm: document.getElementById("create-form"),
  titleInput: document.getElementById("title-input"),
  categoryInput: document.getElementById("category-input"),
  durationInput: document.getElementById("duration-input"),
  energyInput: document.getElementById("energy-input"),
  tagsInput: document.getElementById("tags-input"),
  createStatePills: document.getElementById("create-state-pills"),
  aiGoalInput: document.getElementById("ai-goal-input"),
  aiBreakdownBtn: document.getElementById("ai-breakdown-btn"),
  aiResult: document.getElementById("ai-result")
};

function nowISO() {
  return new Date().toISOString();
}

function safeClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeTaskId() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function defaultLocalData() {
  return {
    tasks: safeClone(DEFAULT_TASKS),
    sessions: [],
    selectedTaskId: DEFAULT_TASKS[0]?.id || null,
    selectedState: "anxious"
  };
}

function loadLocalData() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = defaultLocalData();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : safeClone(DEFAULT_TASKS),
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      selectedTaskId: parsed.selectedTaskId || null,
      selectedState: parsed.selectedState || "anxious"
    };
  } catch (error) {
    console.error(error);
    const fallback = defaultLocalData();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
}

function saveLocalData() {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      tasks: appState.tasks,
      sessions: appState.sessions,
      selectedTaskId: appState.selectedTaskId,
      selectedState: appState.selectedState
    })
  );
}

function visibleTasks() {
  return appState.tasks.filter((task) => !task.archived);
}

function categoryLabel(category) {
  return CATEGORY_LABELS[category] || category || "其他";
}

function energyLabel(level) {
  if (level <= 1) return "低能量";
  if (level === 2) return "中能量";
  return "高能量";
}

function formatDuration(min) {
  return `${min} 分钟`;
}

function formatTime(totalSec) {
  const min = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const sec = String(totalSec % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function prepareLabel(task) {
  return task.tags?.includes("no-prep") ? "无需准备" : "需要准备";
}

function summarizeTask(task) {
  if (!task) {
    return "当前还没有可执行任务，可以先到添加页创建一个。";
  }

  const parts = [];
  if (task.tags?.includes("clear-step")) parts.push("步骤明确");
  if (task.favorite) parts.push("已收藏");
  if (task.playCount > 0) parts.push(`已启动 ${task.playCount} 次`);
  return parts.length > 0 ? parts.join(" · ") : "先做这一小步，把任务温和地启动起来。";
}

function recommendationCopy(stateKey) {
  const option = STATE_OPTIONS.find((item) => item.key === stateKey);
  return option ? option.desc : "根据当前状态，获得更容易开始的任务。";
}

function setStatusPill(text, kind = "warn") {
  elements.healthPill.textContent = text;
  elements.healthPill.className = `status-pill is-${kind}`;
}

function getTaskById(taskId) {
  return visibleTasks().find((task) => task.id === taskId)
    || appState.recommendations.find((task) => task.id === taskId)
    || null;
}

function getCurrentTask() {
  return getTaskById(appState.selectedTaskId) || appState.recommendations[0] || visibleTasks()[0] || null;
}

function getNextTask() {
  const currentId = getCurrentTask()?.id;
  return appState.recommendations.find((task) => task.id !== currentId)
    || visibleTasks().find((task) => task.id !== currentId)
    || null;
}

function computeRecommendations() {
  const stateKey = appState.selectedState;
  const tasks = visibleTasks();
  const sorted = [...tasks].sort((a, b) => scoreTask(b, stateKey) - scoreTask(a, stateKey));
  appState.recommendations = sorted.slice(0, 4);
}

function scoreTask(task, stateKey) {
  let score = 0;
  if (task.recommendedFor?.includes(stateKey)) score += 6;
  if (task.tags?.includes("clear-step")) score += 2;
  if (task.tags?.includes("no-prep")) score += 2;
  if (task.favorite) score += 1;
  score += Math.max(0, 12 - task.durationMin);
  score += Math.max(0, 4 - task.energyLevel);

  if (stateKey === "ten_min" && task.durationMin <= 10) score += 4;
  if (stateKey === "tired" && task.energyLevel === 1) score += 3;
  if (stateKey === "blank" && task.tags?.includes("clear-step")) score += 3;
  if (stateKey === "anxious" && task.tags?.includes("no-prep")) score += 3;

  return score;
}

function renderHeaderStats() {
  const completed = appState.sessions.filter((item) => item.status === "completed").length;
  elements.todayStarted.textContent = String(appState.sessions.length);
  elements.todayCompleted.textContent = String(completed);
  setStatusPill("本地模式", "warn");
  elements.apiTip.textContent = "当前为前端独立模式，数据保存在本地浏览器。";
}

function renderPlayer() {
  const task = getCurrentTask();
  const nextTask = getNextTask();

  if (!task) {
    elements.currentTitle.textContent = "还没有任务";
    elements.currentCategory.textContent = "先创建一个";
    elements.currentSummary.textContent = "到添加页先写一个 2 到 5 分钟的小任务。";
    elements.currentDuration.textContent = "--";
    elements.currentEnergy.textContent = "--";
    elements.currentState.textContent = STATE_OPTIONS.find((item) => item.key === appState.selectedState)?.label || "默认";
    elements.prepareChip.textContent = "等待中";
    elements.favoriteCurrent.textContent = "收藏";
    elements.nextTitle.textContent = "暂无下一项";
    elements.nextSummary.textContent = "任务加载后，这里会出现下一项推荐。";
    elements.nextTags.innerHTML = "";
    renderTimer();
    return;
  }

  elements.currentTitle.textContent = task.title;
  elements.currentCategory.textContent = categoryLabel(task.category);
  elements.currentSummary.textContent = summarizeTask(task);
  elements.currentDuration.textContent = formatDuration(task.durationMin);
  elements.currentEnergy.textContent = energyLabel(task.energyLevel);
  elements.currentState.textContent =
    STATE_OPTIONS.find((item) => item.key === appState.selectedState)?.label || "默认";
  elements.prepareChip.textContent = prepareLabel(task);
  elements.favoriteCurrent.textContent = task.favorite ? "已收藏" : "收藏";
  elements.timerCaption.textContent = appState.activeSessionId
    ? (appState.timerRunning ? "进行中" : "已暂停")
    : "待开始";

  if (nextTask) {
    elements.nextTitle.textContent = nextTask.title;
    elements.nextSummary.textContent = summarizeTask(nextTask);
    elements.nextTags.innerHTML = [
      `<span class="chip">${formatDuration(nextTask.durationMin)}</span>`,
      `<span class="chip">${energyLabel(nextTask.energyLevel)}</span>`,
      `<span class="chip">${categoryLabel(nextTask.category)}</span>`
    ].join("");
  } else {
    elements.nextTitle.textContent = "暂无下一项";
    elements.nextSummary.textContent = "完成当前动作后，可以到清单里手动选择别的任务。";
    elements.nextTags.innerHTML = "";
  }

  renderTimer();
}

function renderTimer() {
  const currentTask = getCurrentTask();
  const total = currentTask ? currentTask.durationMin * 60 : appState.timerTotalSec;
  const safeTotal = Math.max(total, 1);
  const progress = Math.max(0, Math.min(100, (appState.timerRemainingSec / safeTotal) * 100));
  document.documentElement.style.setProperty("--progress", `${progress}%`);
  elements.timerText.textContent = formatTime(appState.timerRemainingSec);
  elements.startToggle.textContent = appState.timerRunning ? "暂停" : (appState.activeSessionId ? "继续" : "开始");
}

function renderLaunch() {
  elements.stateGrid.innerHTML = STATE_OPTIONS.map((item) => `
    <button class="state-btn ${item.key === appState.selectedState ? "active" : ""}" data-state="${item.key}" type="button">
      <strong>${item.label}</strong>
      <span>${item.hint}</span>
    </button>
  `).join("");

  elements.launchStateTitle.textContent =
    STATE_OPTIONS.find((item) => item.key === appState.selectedState)?.label || "默认推荐";
  elements.launchStateChip.textContent = appState.selectedState;
  elements.launchStateCopy.textContent = recommendationCopy(appState.selectedState);

  if (appState.recommendations.length === 0) {
    elements.recommendationList.innerHTML = `<div class="empty-note">暂时没有推荐任务，可以去清单里选一个，或者先新增任务。</div>`;
    return;
  }

  elements.recommendationList.innerHTML = appState.recommendations.map((task) => `
    <article class="recommendation-item">
      <div class="recommendation-actions">
        <div>
          <strong>${task.title}</strong>
          <p>${categoryLabel(task.category)} · ${formatDuration(task.durationMin)} · ${energyLabel(task.energyLevel)}</p>
        </div>
        <button class="ghost-btn pick-recommendation" type="button" data-task-id="${task.id}">使用</button>
      </div>
    </article>
  `).join("");
}

function filteredTasks() {
  const keyword = appState.search.trim().toLowerCase();
  return visibleTasks().filter((task) => {
    const matchCategory = appState.listFilter === "all" || task.category === appState.listFilter;
    const searchBase = [task.title, ...(task.tags || [])].join(" ").toLowerCase();
    const matchSearch = !keyword || searchBase.includes(keyword);
    return matchCategory && matchSearch;
  });
}

function renderList() {
  const categories = ["all", ...new Set(visibleTasks().map((task) => task.category))];
  elements.categoryFilters.innerHTML = categories.map((category) => `
    <button class="filter-chip ${category === appState.listFilter ? "active" : ""}" data-category="${category}" type="button">
      ${categoryLabel(category)}
    </button>
  `).join("");

  const tasks = filteredTasks();
  if (tasks.length === 0) {
    elements.taskList.innerHTML = `<div class="empty-note">当前筛选条件下没有任务，可以换个分类，或者自己添加一个。</div>`;
    return;
  }

  elements.taskList.innerHTML = tasks.map((task) => `
    <article class="task-row">
      <div class="task-row-top">
        <div>
          <strong>${task.title}</strong>
          <p>${categoryLabel(task.category)} · ${formatDuration(task.durationMin)} · ${energyLabel(task.energyLevel)}</p>
        </div>
        <button class="task-action ${task.favorite ? "favorite" : ""}" type="button" data-favorite-id="${task.id}">
          ${task.favorite ? "已收藏" : "收藏"}
        </button>
      </div>
      <div class="tag-row">
        ${(task.tags || []).slice(0, 3).map((tag) => `<span class="chip">${tag}</span>`).join("")}
        <span class="chip">已开始 ${task.playCount || 0}</span>
        <span class="chip">已完成 ${task.completedCount || 0}</span>
      </div>
      <div class="action-grid" style="margin-top:12px;">
        <button class="main-btn choose-task" type="button" data-task-id="${task.id}">立即开始</button>
        <button class="soft-btn delete-task" type="button" data-delete-id="${task.id}">归档</button>
      </div>
    </article>
  `).join("");
}

function renderCreateStates() {
  elements.createStatePills.innerHTML = STATE_OPTIONS.map((item) => `
    <button class="filter-chip ${appState.createStates.includes(item.key) ? "active" : ""}" type="button" data-create-state="${item.key}">
      ${item.label}
    </button>
  `).join("");
}

function renderAll() {
  renderHeaderStats();
  renderPlayer();
  renderLaunch();
  renderList();
  renderCreateStates();
}

function switchScreen(target) {
  appState.currentScreen = target;
  elements.screens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === target);
  });
  elements.navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.target === target);
  });
}

function resetTimerForTask(task) {
  clearInterval(appState.timerIntervalId);
  appState.timerIntervalId = null;
  appState.timerRunning = false;
  appState.activeSessionId = null;
  appState.lastTickAt = null;
  appState.timerTotalSec = (task?.durationMin || 2) * 60;
  appState.timerRemainingSec = appState.timerTotalSec;
  renderTimer();
}

function touchTask(taskId, updater) {
  appState.tasks = appState.tasks.map((task) => {
    if (task.id !== taskId) return task;
    return {
      ...task,
      ...updater(task),
      updatedAt: nowISO()
    };
  });
  saveLocalData();
}

function refreshLocalState() {
  computeRecommendations();
  ensureSelectedTask();
  saveLocalData();
  renderAll();
}

function startLocalTimer() {
  if (appState.timerRunning) return;
  appState.timerRunning = true;
  appState.lastTickAt = Date.now();
  appState.timerIntervalId = window.setInterval(() => {
    const now = Date.now();
    const diff = Math.floor((now - appState.lastTickAt) / 1000);
    if (diff <= 0) return;

    appState.lastTickAt = now;
    appState.timerRemainingSec = Math.max(0, appState.timerRemainingSec - diff);
    renderTimer();

    if (appState.timerRemainingSec <= 0) {
      finishTaskSession("completed");
    }
  }, 250);
  renderPlayer();
}

function pauseLocalTimer() {
  appState.timerRunning = false;
  clearInterval(appState.timerIntervalId);
  appState.timerIntervalId = null;
  renderPlayer();
}

function ensureSelectedTask() {
  const exists = getTaskById(appState.selectedTaskId);
  if (exists) return;
  const fallback = appState.recommendations[0] || visibleTasks()[0] || null;
  appState.selectedTaskId = fallback?.id || null;
  resetTimerForTask(fallback);
}

function refreshApp() {
  const localData = loadLocalData();
  appState.tasks = localData.tasks;
  appState.sessions = localData.sessions;
  appState.selectedTaskId = localData.selectedTaskId;
  appState.selectedState = localData.selectedState;
  computeRecommendations();
  ensureSelectedTask();
  renderAll();
}

function toggleCurrentFavorite() {
  const task = getCurrentTask();
  if (!task) return;
  touchTask(task.id, (item) => ({ favorite: !item.favorite }));
  refreshLocalState();
}

function startOrPauseTask() {
  const task = getCurrentTask();
  if (!task) return;

  if (appState.timerRunning) {
    pauseLocalTimer();
    return;
  }

  if (!appState.activeSessionId) {
    const session = {
      id: makeSessionId(),
      taskId: task.id,
      triggerState: appState.selectedState,
      status: "running",
      elapsedSec: 0,
      note: "",
      startedAt: nowISO(),
      endedAt: null
    };
    appState.sessions = [session, ...appState.sessions].slice(0, 50);
    appState.activeSessionId = session.id;
    touchTask(task.id, (item) => ({ playCount: (item.playCount || 0) + 1 }));
    saveLocalData();
  }

  startLocalTimer();
  renderAll();
}

function finishTaskSession(status) {
  const task = getCurrentTask();
  if (!task) return;

  const elapsedSec = Math.max(appState.timerTotalSec - appState.timerRemainingSec, 0);
  if (appState.activeSessionId) {
    appState.sessions = appState.sessions.map((session) => {
      if (session.id !== appState.activeSessionId) return session;
      return {
        ...session,
        status,
        elapsedSec,
        endedAt: nowISO()
      };
    });
  }

  if (status === "completed") {
    touchTask(task.id, (item) => ({ completedCount: (item.completedCount || 0) + 1 }));
  } else {
    saveLocalData();
  }

  pauseLocalTimer();
  appState.activeSessionId = null;

  computeRecommendations();
  const next = status !== "abandoned"
    ? (getNextTask() || appState.recommendations[0] || visibleTasks()[0] || null)
    : task;
  appState.selectedTaskId = next?.id || null;
  resetTimerForTask(next);
  saveLocalData();
  renderAll();
}

function chooseTask(taskId, screen = "player") {
  const task = getTaskById(taskId);
  if (!task) return;
  appState.selectedTaskId = taskId;
  resetTimerForTask(task);
  saveLocalData();
  renderAll();
  switchScreen(screen);
}

function deleteTask(taskId) {
  touchTask(taskId, () => ({ archived: true }));
  if (appState.selectedTaskId === taskId) {
    appState.selectedTaskId = null;
  }
  refreshLocalState();
}

function createTask(event) {
  event.preventDefault();
  const title = elements.titleInput.value.trim();
  if (!title) return;

  const tags = elements.tagsInput.value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const task = {
    id: makeTaskId(),
    title,
    category: elements.categoryInput.value,
    durationMin: Number(elements.durationInput.value),
    energyLevel: Number(elements.energyInput.value),
    favorite: false,
    source: "user",
    tags,
    recommendedFor: [...appState.createStates],
    playCount: 0,
    completedCount: 0,
    archived: false,
    createdAt: nowISO(),
    updatedAt: nowISO()
  };

  appState.tasks = [task, ...appState.tasks];
  appState.selectedTaskId = task.id;
  elements.createForm.reset();
  appState.createStates = ["anxious"];
  appState.aiSuggestion = null;
  elements.aiResult.textContent = "任务已创建。";
  resetTimerForTask(task);
  refreshLocalState();
  switchScreen("player");
}

function runAiBreakdown() {
  const goal = elements.aiGoalInput.value.trim();
  if (!goal) {
    elements.aiResult.textContent = "请先输入一个较大的任务目标。";
    return;
  }

  const normalized = goal.replace(/\s+/g, " ").trim();
  const suggestionTitle = normalized.length > 12
    ? `先写：${normalized.slice(0, 12)}`
    : `先开始：${normalized}`;
  const firstStep = `把“${normalized}”拆成一句最小动作，先写下第一步。`;

  appState.aiSuggestion = {
    suggestionTitle,
    durationMin: 5,
    energyLevel: 1,
    steps: [firstStep]
  };

  elements.titleInput.value = suggestionTitle;
  elements.durationInput.value = "5";
  elements.energyInput.value = "1";
  elements.tagsInput.value = "clear-step";
  elements.aiResult.textContent = `${suggestionTitle} · ${firstStep}`;
}

function bindEvents() {
  elements.navButtons.forEach((button) => {
    button.addEventListener("click", () => switchScreen(button.dataset.target));
  });

  elements.refreshBtn.addEventListener("click", refreshApp);
  elements.favoriteCurrent.addEventListener("click", toggleCurrentFavorite);
  elements.startToggle.addEventListener("click", startOrPauseTask);
  elements.completeTask.addEventListener("click", () => finishTaskSession("completed"));
  elements.skipTask.addEventListener("click", () => finishTaskSession("skipped"));
  elements.useNextTask.addEventListener("click", () => {
    const nextTask = getNextTask();
    if (nextTask) chooseTask(nextTask.id, "player");
  });

  elements.stateGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-state]");
    if (!button) return;
    appState.selectedState = button.dataset.state;
    appState.selectedTaskId = getCurrentTask()?.id || appState.selectedTaskId;
    refreshLocalState();
  });

  elements.recommendationList.addEventListener("click", (event) => {
    const button = event.target.closest(".pick-recommendation");
    if (!button) return;
    chooseTask(button.dataset.taskId, "player");
  });

  elements.taskSearch.addEventListener("input", (event) => {
    appState.search = event.target.value;
    renderList();
  });

  elements.categoryFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    appState.listFilter = button.dataset.category;
    renderList();
  });

  elements.taskList.addEventListener("click", (event) => {
    const favoriteBtn = event.target.closest("[data-favorite-id]");
    const chooseBtn = event.target.closest("[data-task-id]");
    const deleteBtn = event.target.closest("[data-delete-id]");

    if (favoriteBtn) {
      touchTask(favoriteBtn.dataset.favoriteId, (task) => ({ favorite: !task.favorite }));
      refreshLocalState();
      return;
    }

    if (chooseBtn) {
      chooseTask(chooseBtn.dataset.taskId, "player");
      return;
    }

    if (deleteBtn) {
      deleteTask(deleteBtn.dataset.deleteId);
    }
  });

  elements.createStatePills.addEventListener("click", (event) => {
    const button = event.target.closest("[data-create-state]");
    if (!button) return;
    const key = button.dataset.createState;
    if (appState.createStates.includes(key)) {
      appState.createStates = appState.createStates.filter((item) => item !== key);
    } else {
      appState.createStates = [...appState.createStates, key];
    }
    if (appState.createStates.length === 0) {
      appState.createStates = ["anxious"];
    }
    renderCreateStates();
  });

  elements.createForm.addEventListener("submit", createTask);
  elements.aiBreakdownBtn.addEventListener("click", runAiBreakdown);
}

bindEvents();
refreshApp();
