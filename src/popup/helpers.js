//#region Set Variables
let body = document.querySelector("body");

let themeToggle = document.querySelector("#theme-toggle");
let save = document.querySelector("#save");
let saved = document.querySelector("#saved");
let viewOptions = document.querySelector("#view-options");

let first = document.querySelector("#chosen-first-name");
let middle = document.querySelector("#chosen-middle-name");
let last = document.querySelector("#chosen-last-name");

let deadFirst = document.querySelector("#dead-first-name");
let deadMiddle = document.querySelector("#dead-middle-name");
let deadLast = document.querySelector("#dead-last-name");

let extension = document.querySelector("#extension-toggle");
let stealth = document.querySelector("#stealth-toggle");
let highlight = document.querySelector("#highlight-indicator-toggle");
//#endregion

//#region Functions
// Theme
function getTheme() {
  chrome.storage.sync.get("theme", (result) => {
    themeToggle.value = result.theme;
    changeTheme();
    if (!document.querySelector("body#popup")) changeIcon();
  });
}

function setTheme() {
  chrome.storage.sync.set({ theme: themeToggle.value });
}

// Settings
function getSettings() {
  // Get Settings from Chrome Sync Storage
  let getChromeStorage = new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get((result) => resolve(result));
    } catch {
      alert("A fatal error has occured. Please open an issue on GitHub with information of what you were doing before this error occured, and provide the following message:\n\nError: getting data from Chrome Storage in getSettings()");
      reject();
    }
  });

  getChromeStorage.then((settings) => {
    // Set Chosen Name
    first.value = settings.name.first;
    middle.value = settings.name.middle;
    last.value = settings.name.last;

    // Set Deadname(s)
    deadFirst.value = settings.deadname.first.join(", ");
    deadMiddle.value = settings.deadname.middle.join(", ");
    deadLast.value = settings.deadname.last.join(", ");

    // Set Options
    stealth.checked = settings.stealth;
    highlight.checked = settings.highlight;
  });
}

function saveSettings() {
  let setChromeStorage = new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.set({
        name: {
          first: first.value,
          middle: middle.value,
          last: last.value,
        },
        deadname: {
          first: deadFirst.value.split(",").map((name) => name.trim()),
          middle: deadMiddle.value.split(",").map((name) => name.trim()),
          last: deadLast.value.split(",").map((name) => name.trim()),
        },
        stealth: stealth.checked,
        highlight: highlight.checked,
      });
      resolve();
    } catch {
      alert("A fatal error has occured. Please open an issue on GitHub with information of what you were doing before this error occured, and provide the following message:\n\nError: setting data to Chrome Storage in saveSettings()");
      reject();
    }
  });

  // Display "Saved" Message on Options Page
  setChromeStorage.then(() => {
    saved.hidden = false;
    saved.classList.add("flash-alert");
    setTimeout(() => {
      saved.hidden = true;
      saved.classList.remove("flash-alert");
    }, 5000);
  });
}
//#endregion
