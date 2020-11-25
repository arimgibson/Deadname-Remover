//#region Functions
function changeTheme() {
  let x = themeToggle.value;
  if (x === "high-contrast-light" || x === "high-contrast-dark") {
    document.querySelector("#show-hide-deadnames").dataset.text = "";
    document.querySelector("#show-hide-deadnames").innerHTML = "Show/Hide Deadnames";

    save.dataset.text = "";
    save.innerHTML = "Save Chosen and Deadname Settings";

    if (x === "high-contrast-light") {
      body.className = "high-contrast-light";
    } else {
      body.className = "high-contrast-dark";
    }
  } else {
    document.querySelector("#show-hide-deadnames").innerHTML = "";
    document.querySelector("#show-hide-deadnames").dataset.text = "Show/Hide Deadnames";

    save.innerHTML = "";
    save.dataset.text = "Save Chosen and Deadname Settings";

    if (x === "non-binary") {
      body.className = "non-binary";
    } else {
      body.className = "trans";
    }
  }
}

function changeIcon() {
  let x = themeToggle.value;
  let y = document.querySelector("link[rel='icon']");
  if (x === "non-binary") {
    y.href = "../icons/nb19.png";
  } else {
    y.href = "../icons/trans19.png";
  }
}
//#endregion

//#region Event Listeners
themeToggle.onchange = function () {
  setTheme();
  changeTheme();
  changeIcon();
};

document.querySelector("#show-hide-deadnames").onclick = function () {
  let x = document.querySelector("#deadname-form");
  if (x.hidden === true) {
    x.hidden = false;
  } else {
    x.hidden = true;
  }
};

save.onclick = function () {
  saveSettings();
};
//#endregion

//#region Call Functions Immediately
getTheme();
getSettings();
//#endregion
