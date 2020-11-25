//#region Functions
function changeTheme() {
  let x = themeToggle.value;
  if (x === "high-contrast-light" || x === "high-contrast-dark") {
    viewOptions.dataset.text = "";
    viewOptions.innerHTML = "View All Options";

    if (x === "high-contrast-light") {
      body.className = "high-contrast-light";
    } else {
      body.className = "high-contrast-dark";
    }
  } else {
    viewOptions.innerHTML = "";
    viewOptions.dataset.text = "View All Options";

    if (x === "non-binary") {
      body.className = "non-binary";
    } else {
      body.className = "trans";
    }
  }
}
//#endregion

//#region Event Listeners
themeToggle.onchange = function () {
  setTheme();
  changeTheme();
};

extension.onchange = function () {
  chrome.storage.sync.set({ extension: extension.checked });
};

stealth.onchange = function () {
  chrome.storage.sync.set({ stealth: stealth.checked });
};

highlight.onchange = function () {
  chrome.storage.sync.set({ highlight: highlight.checked });
};

viewOptions.onclick = function () {
  chrome.tabs.create({ url: "/popup/options.html" });
};
//#endregion

//#region Call Functions Immediately
getTheme();
//#endregion
