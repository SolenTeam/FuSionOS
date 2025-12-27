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
  btn.addEventListener("click", () => {
    loadFolder(btn.dataset.path);
  });
});

loadFolder("home");


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
      if (!parts[1]) termPrint("Usage: open <app>");
      else {
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
      termPrint("Unknown command: " + base);
  }
}

termInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const cmd = termInput.value;
    termPrint("$ " + cmd);
    runCommand(cmd);
    termInput.value = "";
  }
});


/* ===========================
   MUSIC PLAYER
=========================== */

let musicPlaying = false;
let musicProgress = 0;
const progressBar = document.querySelector(".music-progress-bar");
const timeCurrent = document.querySelector(".time-current");

document.querySelector(".btn-play").addEventListener("click", () => {
  musicPlaying = !musicPlaying;
});

setInterval(() => {
  if (!musicPlaying) return;

  musicProgress += 0.5;
  const total = 210;

  if (musicProgress >= total) {
    musicProgress = 0;
    musicPlaying = false;
  }

  const percent = (musicProgress / total) * 100;
  progressBar.style.width = percent + "%";

  const m = Math.floor(musicProgress / 60).toString().padStart(2, "0");
  const s = Math.floor(musicProgress % 60).toString().padStart(2, "0");
  timeCurrent.textContent = `${m}:${s}`;
}, 500);


/* ===========================
   BROWSER
=========================== */

document.querySelector(".browser-url").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const view = document.querySelector(".browser-view");
    view.innerHTML = `
      <h3>Navigation Disabled</h3>
      <p>This is a demo browser. No real navigation is available.</p>
    `;
  }
});
