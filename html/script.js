//#region Functions
function theme() {
  let x = document.querySelector("#high-contrast");
  let y = document.querySelector("#trans-non-binary");
  if (x.checked === true) {
    document.querySelector("body").className = "high-contrast";
    document.querySelector(".trans").hidden = true;
    document.querySelector(".non-binary").hidden = true;
    document.querySelector(".switch-container").style.display = "none";

    document.querySelector("#show-hide").dataset.text = "";
    document.querySelector("#show-hide").innerHTML = "Show/Hide Deadnames";

    document.querySelector("#save").dataset.text = "";
    document.querySelector("#save").innerHTML = "Save Chosen and Deadname Settings";
  } else {
    document.querySelector(".trans").hidden = false;
    document.querySelector(".non-binary").hidden = false;
    document.querySelector(".switch-container").style.display = "flex";

    document.querySelector("#show-hide").innerHTML = "";
    document.querySelector("#show-hide").dataset.text = "Show/Hide Deadnames";

    document.querySelector("#save").innerHTML = "";
    document.querySelector("#save").dataset.text = "Save Chosen and Deadname Settings";
    if (y.checked === true) {
      document.querySelector("body").className = "non-binary";
    } else {
      document.querySelector("body").className = "trans";
    }
  }
}

function icon() {
  let x = document.querySelector("link[rel='icon']");
  let y = document.querySelector("#trans-non-binary");
  if (y.checked === true) {
    x.href = "non-binary.ico";
  } else {
    x.href = "transgender.ico";
  }
}
//#endregion

//#region Event Listeners
document.querySelector("#trans-non-binary").onchange = function () {
  theme();
  icon();
};

document.querySelector("#high-contrast").onchange = function () {
  theme();
};

document.querySelector("#show-hide").onclick = function () {
  let x = document.querySelector("#deadname-form");
  if (x.hidden === true) {
    x.hidden = false;
  } else {
    x.hidden = true;
  }
};

document.querySelector("#save").onclick = function () {
  let x = document.querySelector("#saved");
  x.hidden = false;
  x.classList.add("flash-alert");
  setTimeout(() => {
    x.hidden = true;
    x.classList.remove("flash-alert");
  }, 3000);
};
//#endregion

//#region Call Functions Immediately
theme();
icon();
//#endregion
