/* ===========================
   BASIC STATE
=========================== */
const icons = document.querySelectorAll(".icon");
const windowsEls = document.querySelectorAll(".window");
const taskbar = document.getElementById("taskbar-apps");
const clock = document.getElementById("clock");
const startButton = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");
const startApps = document.querySelectorAll(".start-app");
const startPowerButtons = document.querySelectorAll(".start-power");
const splash = document.getElementById("splash");
const blackScreen = document.getElementById("black-screen");
const blackIcon = document.getElementById("black-icon");
const standbyOverlay = document.getElementById("standby-message");
const desktop = document.getElementById("desktop");

/* Dock */
const dockMain = document.querySelector(".dock-main");
const dockRecent = document.getElementById("dock-recent");
const dockDivider = document.getElementById("dock-divider");
const dockItems = document.querySelectorAll(".dock-item");

/* Context menu */
const contextMenu = document.getElementById("context-menu");
const ctxButtons = document.querySelectorAll(".ctx-btn");

let zIndexCounter = 500;
let isInStandby = false;

/* Stato app: open/hidden per recent section */
const appState = {}; // { appId: { open: bool, hidden: bool } }
const recentApps = []; // max 2 appId

/* Contesto corrente per context menu */
let ctxTarget = null; // { type, appId, windowId }

/* ===========================
   UTILS
=========================== */
function getWindowByAppId(appId) {
  return document.querySelector(`.window[data-app-id="${appId}"]`);
}

function getAppIdFromWindow(win) {
  return win.dataset.appId || null;
}

function ensureAppState(appId) {
  if (!appState[appId]) {
    appState[appId] = { open: false, hidden: false };
  }
}

/* ===========================
   WINDOW MANAGEMENT
=========================== */
function openWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;

  const appId = getAppIdFromWindow(win);
  if (appId) {
    ensureAppState(appId);
    appState[appId].open = true;
    appState[appId].hidden = false;
    addRecentApp(appId);
  }

  win.style.display = "flex";
  focusWindow(win);

  if (window.innerWidth <= 700) {
    win.classList.add("fullscreen");
  }

  addToTaskbar(id);
  renderDockRecent();
}

function closeWindow(win) {
  const appId = getAppIdFromWindow(win);
  win.style.display = "none";

  if (appId) {
    ensureAppState(appId);
    appState[appId].open = false;
    appState[appId].hidden = false;
    removeFromRecent(appId);
  }

  removeFromTaskbar(win.id);
  renderDockRecent();
}

function minimizeWindow(win) {
  const appId = getAppIdFromWindow(win);
  win.style.display = "none";

  if (appId) {
    ensureAppState(appId);
    appState[appId].open = true;
    appState[appId].hidden = true;
    addRecentApp(appId);
  }

  renderDockRecent();
}

function focusWindow(win) {
  zIndexCounter++;
  win.style.zIndex = zIndexCounter;
  windowsEls.forEach(w => w.classList.remove("active"));
  win.classList.add("active");
}

/* ===========================
   TASKBAR
=========================== */
function addToTaskbar(id) {
  if (document.querySelector(`.taskbar-item[data-window="${id}"]`)) return;

  const win = document.getElementById(id);
  const appId = getAppIdFromWindow(win) || id.replace("win-", "");

  const item = document.createElement("div");
  item.className = "taskbar-item";
  item.dataset.window = id;
  item.dataset.appId = appId;
  item.textContent = appId;
  item.addEventListener("click", () => {
    const w = document.getElementById(id);
    if (!w) return;
    if (w.style.display === "none" || w.style.display === "") {
      openWindow(id);
    } else {
      focusWindow(w);
    }
  });

  attachContextMenuHandlers(item, { type: "taskbar", appId, windowId: id });

  taskbar.appendChild(item);
}

function removeFromTaskbar(id) {
  const item = document.querySelector(`.taskbar-item[data-window="${id}"]`);
  if (item) item.remove();
}

/* ===========================
   DOCK RECENT APPS
=========================== */
function addRecentApp(appId) {
  ensureAppState(appId);

  // se già presente, sposta in cima
  const index = recentApps.indexOf(appId);
  if (index !== -1) {
    recentApps.splice(index, 1);
  }
  recentApps.unshift(appId);

  // max 2
  if (recentApps.length > 2) {
    recentApps.pop();
  }
}

function removeFromRecent(appId) {
  const index = recentApps.indexOf(appId);
  if (index !== -1) {
    recentApps.splice(index, 1);
  }
}

function renderDockRecent() {
  if (!dockRecent) return;
  dockRecent.innerHTML = "";

  if (recentApps.length === 0) {
    dockDivider.style.display = "none";
    return;
  }

  dockDivider.style.display = "block";

  recentApps.forEach(appId => {
    const btn = document.createElement("button");
    btn.className = "dock-recent-item";
    btn.dataset.appId = appId;

    // icona in base all'app
    let icon = "📦";
    if (appId === "browser") icon = "🌐";
    if (appId === "files") icon = "🗂️";
    if (appId === "terminal") icon = ">";
    if (appId === "settings") icon = "⚙️";
    if (appId === "notes") icon = "📝";
    if (appId === "about") icon = "OS";

    btn.textContent = icon;

    // pallino verde se hidden
    ensureAppState(appId);
    if (appState[appId].open && appState[appId].hidden) {
      const dot = document.createElement("div");
      dot.className = "dock-indicator";
      btn.appendChild(dot);
    }

    btn.addEventListener("click", () => {
      const win = getWindowByAppId(appId);
      if (!win) return;
      openWindow(win.id);
    });

    attachContextMenuHandlers(btn, { type: "dock-recent", appId, windowId: getWindowByAppId(appId)?.id });

    dockRecent.appendChild(btn);
  });
}

/* ===========================
   ICONS & DOCK FIXED
=========================== */
icons.forEach(icon => {
  const target = icon.dataset.window;
  if (!target) return;

  const appId = icon.dataset.appId || target.replace("win-", "");

  icon.addEventListener("dblclick", () => openWindow(target));
  icon.addEventListener("click", () => {
    if (window.innerWidth <= 700) openWindow(target);
  });

  attachContextMenuHandlers(icon, { type: "desktop-icon", appId, windowId: target });
});

dockItems.forEach(btn => {
  const winId = btn.dataset.window;
  const appId = btn.dataset.appId;

  btn.addEventListener("click", () => openWindow(winId));

  attachContextMenuHandlers(btn, { type: "dock-main", appId, windowId: winId });
});

/* ===========================
   START MENU
=========================== */
startButton.addEventListener("click", e => {
  e.stopPropagation();
  startMenu.classList.toggle("open");
});

document.addEventListener("click", () => {
  startMenu.classList.remove("open");
  hideContextMenu();
});

startApps.forEach(btn => {
  btn.addEventListener("click", () => {
    openWindow(btn.dataset.window);
    startMenu.classList.remove("open");
  });
});

/* ===========================
   WINDOW BUTTONS + DRAG
=========================== */
windowsEls.forEach(win => {
  const btnClose = win.querySelector(".btn-close");
  const btnMin = win.querySelector(".btn-minimize");
  const btnFull = win.querySelector(".btn-fullscreen");
  const titlebar = win.querySelector(".window-titlebar");
  const id = win.id;
  const appId = getAppIdFromWindow(win);

  if (btnClose) btnClose.addEventListener("click", () => closeWindow(win));
  if (btnMin) btnMin.addEventListener("click", () => minimizeWindow(win));
  if (btnFull) btnFull.addEventListener("click", () => win.classList.toggle("fullscreen"));

  // Drag
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  titlebar.addEventListener("mousedown", e => {
    if (win.classList.contains("fullscreen")) return;
    dragging = true;
    focusWindow(win);
    const rect = win.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  });

  document.addEventListener("mousemove", e => {
    if (!dragging) return;
    win.style.left = e.clientX - offsetX + "px";
    win.style.top = e.clientY - offsetY + "px";
  });

  document.addEventListener("mouseup", () => dragging = false);

  attachContextMenuHandlers(win, { type: "window", appId, windowId: id });
});

/* ===========================
   CLOCK
=========================== */
function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
updateClock();
setInterval(updateClock, 30000);

/* ===========================
   SPLASH
=========================== */
function playSplash(callback) {
  splash.style.display = "flex";
  splash.classList.add("visible");

  setTimeout(() => {
    splash.classList.remove("visible");
    splash.style.display = "none";
    if (callback) callback();
  }, 2500);
}

/* ===========================
   STANDBY & REBOOT
=========================== */
function showBlack(icon, duration, callback) {
  blackIcon.textContent = icon;
  blackScreen.querySelector(".black-title").textContent = "NamixOS";
  blackScreen.style.display = "flex";
  blackScreen.classList.add("visible");

  setTimeout(() => {
    blackScreen.classList.remove("visible");
    blackScreen.style.display = "none";
    if (callback) callback();
  }, duration);
}

function enterStandby() {
  windowsEls.forEach(w => w.style.display = "none");

  showBlack("⏸", 1500, () => {
    standbyOverlay.style.display = "flex";
    standbyOverlay.classList.add("visible");
    isInStandby = true;
  });
}

function wakeFromStandby() {
  if (!isInStandby) return;

  standbyOverlay.classList.remove("visible");
  standbyOverlay.style.display = "none";
  isInStandby = false;

  showBlack("⏸", 1500, () => playSplash(() => {}));
}

standbyOverlay.addEventListener("click", wakeFromStandby);

function enterReboot() {
  // close all windows & reset app state (tranne wallpaper)
  windowsEls.forEach(w => {
    w.style.display = "none";
  });

  for (const appId in appState) {
    appState[appId].open = false;
    appState[appId].hidden = false;
  }
  recentApps.splice(0, recentApps.length);
  renderDockRecent();
  taskbar.innerHTML = "";

  showBlack("🔄", 3000, () => {
    playSplash(() => {});
  });
}

startPowerButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.dataset.action === "standby") enterStandby();
    if (btn.dataset.action === "reboot") enterReboot();
  });
});

/* ===========================
   MOBILE FULLSCREEN
=========================== */
function mobileMode() {
  const isMobile = window.innerWidth <= 700;
  windowsEls.forEach(win => {
    if (win.style.display !== "none") {
      win.classList.toggle("fullscreen", isMobile);
    }
  });
}
window.addEventListener("resize", mobileMode);

/* ===========================
   CONTEXT MENU (desktop + mobile)
=========================== */
function showContextMenu(x, y, meta) {
  ctxTarget = meta;
  contextMenu.style.display = "flex";

  const menuRect = contextMenu.getBoundingClientRect();
  let posX = x;
  let posY = y;

  if (posX + menuRect.width > window.innerWidth) {
    posX = window.innerWidth - menuRect.width - 5;
  }
  if (posY + menuRect.height > window.innerHeight) {
    posY = window.innerHeight - menuRect.height - 5;
  }

  contextMenu.style.left = posX + "px";
  contextMenu.style.top = posY + "px";
}

function hideContextMenu() {
  contextMenu.style.display = "none";
  ctxTarget = null;
}

function attachContextMenuHandlers(element, meta) {
  if (!element) return;

  // desktop: right-click
  element.addEventListener("contextmenu", e => {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e.clientX, e.clientY, meta);
  });

  // mobile: long press
  let touchTimer = null;
  element.addEventListener("touchstart", e => {
    touchTimer = setTimeout(() => {
      const touch = e.touches[0];
      showContextMenu(touch.clientX, touch.clientY, meta);
    }, 600);
  });
  element.addEventListener("touchend", () => {
    clearTimeout(touchTimer);
  });
}

document.addEventListener("click", () => {
  hideContextMenu();
});
document.addEventListener("scroll", () => {
  hideContextMenu();
});

/* Azioni context menu */
ctxButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (!ctxTarget) return;
    const action = btn.dataset.action;
    const { appId, windowId } = ctxTarget;
    let win = windowId ? document.getElementById(windowId) : getWindowByAppId(appId);

    if (!win && appId) {
      win = getWindowByAppId(appId);
    }
    if (!win) {
      hideContextMenu();
      return;
    }

    if (action === "open") {
      openWindow(win.id);
    } else if (action === "hide") {
      minimizeWindow(win);
    } else if (action === "close") {
      closeWindow(win);
    }

    hideContextMenu();
  });
});

/* ===========================
   WALLPAPER LOAD FROM LOCALSTORAGE
=========================== */
function applySavedWallpaper() {
  const saved = localStorage.getItem("namixos_wallpaper");
  if (!saved) return; // user default dal CSS

  try {
    const data = JSON.parse(saved);
    if (data.type === "css") {
      desktop.style.background = data.value;
    } else if (data.type === "image") {
      desktop.style.background = `url(${data.value}) center/cover no-repeat`;
    }
  } catch (e) {
    console.warn("Wallpaper data invalid");
  }
}

/* ===========================
   INIT
=========================== */
playSplash(() => {});
blackScreen.style.display = "none";
standbyOverlay.style.display = "none";

applySavedWallpaper();
mobileMode();
