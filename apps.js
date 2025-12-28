/* ===========================
   FILE MANAGER
=========================== */

const fileSystem = {
  home: ["notes.txt", "todo.txt", "image.png"],
  documents: ["project.docx", "resume.pdf"],
  music: ["demo-track.mp3"]
};

const fmList = document.getElementById("fm-list");
const fmPath = document.getElementById("fm-path");

function loadFolder(path) {
  if (!fileSystem[path]) return;
  fmPath.textContent = path;
  fmList.innerHTML = "";

  fileSystem[path].forEach(item => {
    const div = document.createElement("div");
    div.className = "fm-item";
    div.textContent = item;
    fmList.appendChild(div);
  });
}

document.querySelectorAll(".fm-nav-item").forEach(btn => {
  btn.addEventListener("click", () => loadFolder(btn.dataset.path));
});

if (fmList && fmPath) {
  loadFolder("home");
}

/* ===========================
   TERMINAL
=========================== */

const termOutput = document.getElementById("terminal-output");
const termInput = document.querySelector(".terminal-input");

function termPrint(text) {
  termOutput.innerHTML += text + "\n";
  termOutput.scrollTop = termOutput.scrollHeight;
}

function runCommand(cmd) {
  const parts = cmd.trim().split(" ");
  const base = parts[0];

  switch (base) {
    case "help":
      termPrint("Commands:\nhelp\nls\ncd <folder>\nopen <app>\nclear\nabout");
      break;

    case "ls":
      termPrint("home  documents  music");
      break;

    case "cd":
      if (!parts[1]) termPrint("Usage: cd <folder>");
      else if (fileSystem[parts[1]]) termPrint("Moved to " + parts[1]);
      else termPrint("Folder not found");
      break;

    case "open":
      if (!parts[1]) {
        termPrint("Usage: open <app>");
      } else {
        const id = "win-" + parts[1];
        if (document.getElementById(id)) {
          openWindow(id);
          termPrint("Opening " + parts[1] + "...");
        } else termPrint("App not found");
      }
      break;

    case "clear":
      termOutput.innerHTML = "";
      break;

    case "about":
      termPrint("NamixOS Terminal\nPowered by SOLEN.");
      break;

    default:
      if (base) termPrint("Unknown command: " + base);
  }
}

if (termInput && termOutput) {
  termInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const cmd = termInput.value;
      termPrint("$ " + cmd);
      runCommand(cmd);
      termInput.value = "";
    }
  });
}

/* ===========================
   BROWSER WITH DUCKDUCKGO SEARCH
=========================== */

const browserUrl = document.querySelector(".browser-url");
const browserView = document.querySelector(".browser-view");

async function performSearch(query) {
  if (!browserView) return;
  browserView.innerHTML = `<p>Searching for "<b>${query}</b>"...</p>`;

  try {
    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
    );
    const data = await res.json();

    if (!data.Abstract && (!data.RelatedTopics || data.RelatedTopics.length === 0)) {
      browserView.innerHTML = `
        <h3>No results found</h3>
        <p>Try another search.</p>
      `;
      return;
    }

    let html = "";

    if (data.Heading) {
      html += `<h2>${data.Heading}</h2>`;
    }

    if (data.Abstract) {
      html += `<p>${data.Abstract}</p>`;
    }

    if (data.AbstractURL) {
      html += `<p><a href="${data.AbstractURL}" target="_blank">Open source</a></p>`;
    }

    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      html += `<h3>Related</h3><ul>`;
      data.RelatedTopics.slice(0, 5).forEach(item => {
        if (item.Text && item.FirstURL) {
          html += `<li><a href="${item.FirstURL}" target="_blank">${item.Text}</a></li>`;
        }
      });
      html += `</ul>`;
    }

    browserView.innerHTML = html;

  } catch (err) {
    browserView.innerHTML = `
      <h3>Error</h3>
      <p>Unable to fetch results.</p>
    `;
  }
}

if (browserUrl) {
  browserUrl.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const query = browserUrl.value.trim();
      if (query.length > 0) {
        performSearch(query);
      }
    }
  });
}

/* ===========================
   SETTINGS: TABS
=========================== */

const tabs = document.querySelectorAll(".settings-tab");
const pages = document.querySelectorAll(".settings-page");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    pages.forEach(p => p.classList.remove("active"));
    const page = document.getElementById("settings-" + tab.dataset.tab);
    if (page) page.classList.add("active");
  });
});

const defaultPage = document.getElementById("settings-lang");
if (defaultPage) defaultPage.classList.add("active");

/* ===========================
   WALLPAPERS (5 CSS + 3 IMAGES)
=========================== */

const wallpapers = [
  {
    type: "css",
    name: "Deep Space Gradient",
    value: "radial-gradient(circle at top, #3b4cca 0%, #050517 40%, #010108 100%)"
  },
  {
    type: "css",
    name: "Violet Neon Grid",
    value: "linear-gradient(135deg, #1a002b 0%, #4a148c 40%, #000000 100%)"
  },
  {
    type: "css",
    name: "Green Cyber Glow",
    value: "radial-gradient(circle at center, #00ff9d 0%, #003320 30%, #000000 100%)"
  },
  {
    type: "css",
    name: "Dark Minimal",
    value: "linear-gradient(135deg, #0b0b0b 0%, #151515 40%, #050505 100%)"
  },
  {
    type: "css",
    name: "SOLEN Rainbow",
    value: "linear-gradient(135deg, red, orange, yellow, green, cyan, blue, violet)"
  },
  {
    type: "image",
    name: "Abstract Mountains",
    value: "wallpapers/wall6.jpg"
  },
  {
    type: "image",
    name: "Blurred City Lights",
    value: "wallpapers/wall7.jpg"
  },
  {
    type: "image",
    name: "Minimal Shapes",
    value: "wallpapers/wall8.jpg"
  }
];

const grid = document.getElementById("wallpaper-grid");

function saveWallpaper(wp) {
  localStorage.setItem("namixos_wallpaper", JSON.stringify(wp));
}

function applyWallpaper(wp) {
  const desktopEl = document.getElementById("desktop");
  if (!desktopEl) return;

  if (wp.type === "css") {
    desktopEl.style.background = wp.value;
  } else {
    desktopEl.style.background = `url(${wp.value}) center/cover no-repeat`;
  }
}

function markSelectedThumb(selectedIndex) {
  const thumbs = document.querySelectorAll(".wallpaper-thumb");
  thumbs.forEach((t, i) => {
    if (i === selectedIndex) t.classList.add("selected");
    else t.classList.remove("selected");
  });
}

if (grid && desktop) {
  wallpapers.forEach((wp, index) => {
    const div = document.createElement("div");
    div.className = "wallpaper-thumb";
    div.title = wp.name;

    if (wp.type === "css") {
      div.style.background = wp.value;
    } else {
      div.style.backgroundImage = `url(${wp.value})`;
    }

    div.addEventListener("click", () => {
      applyWallpaper(wp);
      saveWallpaper(wp);
      markSelectedThumb(index);
    });

    grid.appendChild(div);
  });

  // applica selezione visuale se esiste un wallpaper salvato
  const saved = localStorage.getItem("namixos_wallpaper");
  if (saved) {
    try {
      const data = JSON.parse(saved);
      const idx = wallpapers.findIndex(w =>
        w.type === data.type && w.value === data.value
      );
      if (idx !== -1) {
        markSelectedThumb(idx);
      }
    } catch (e) {}
  } else {
    // se non c'è nulla salvato, seleziona il primo (default)
    markSelectedThumb(0);
  }
}
