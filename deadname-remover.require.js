"use strict";
var DeadnameRemover = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: !0 });
  }, __copyProps = (to, from, except, desc) => {
    if (from && typeof from == "object" || typeof from == "function")
      for (let key of __getOwnPropNames(from))
        !__hasOwnProp.call(to, key) && key !== except && __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: !0 }), mod);

  // src/inject/inject.ts
  var inject_exports = {};
  __export(inject_exports, {
    start: () => start
  });

  // src/types.ts
  var DEFAULT_SETTINGS = {
    name: {
      first: "",
      middle: "",
      last: ""
    },
    deadname: [{
      first: "",
      middle: "",
      last: ""
    }],
    enabled: !0,
    stealthMode: !1,
    highlight: !1,
    ignoreCase: !0
  };

  // src/inject/dom.ts
  function isDOMReady() {
    return document.readyState === "complete" || document.readyState === "interactive";
  }
  var readyStateListeners = /* @__PURE__ */ new Set();
  function addDOMReadyListener(listener) {
    readyStateListeners.add(listener);
  }
  var domAction = (callback) => {
    isDOMReady() ? callback() : addDOMReadyListener(callback);
  };
  if (!isDOMReady()) {
    let onReadyStateChange = () => {
      isDOMReady() && (document.removeEventListener("readystatechange", onReadyStateChange), readyStateListeners.forEach((listener) => listener()), readyStateListeners.clear());
    };
    document.addEventListener("readystatechange", onReadyStateChange);
  }

  // src/inject/inject.ts
  var cachedWords = /* @__PURE__ */ new Map(), observer = null, aliveName = null, deadName = null, newWords = [], oldWords = [], revert = !1, highlight, ignoreCase;
  function start(settings = DEFAULT_SETTINGS) {
    cleanUp(), settings.enabled && (highlight = settings.highlight, aliveName = settings.name, deadName = settings.deadname, ignoreCase = settings.ignoreCase, initalizeWords(), replaceDOMWithNewWords());
  }
  function cleanUp() {
    newWords.length === 0 || oldWords.length === 0 || (observer && observer.disconnect(), revert = !0, [newWords, oldWords] = [oldWords, newWords], replaceDOMWithNewWords(), [newWords, oldWords] = [oldWords, newWords], revert = !1, cachedWords.clear());
  }
  function initalizeWords() {
    newWords = [], oldWords = [];
    let isAliveNameFirst = !!aliveName.first, isAliveNameMiddle = !!aliveName.middle, isAliveNameLast = !!aliveName.last;
    for (let x = 0, len = deadName.length; x < len; x++) {
      let isDeadNameFirst = !!deadName[x].first, isDeadNameMiddle = !!deadName[x].middle, isDeadNameLast = !!deadName[x].last;
      if (isAliveNameFirst && isDeadNameFirst && isAliveNameMiddle && isDeadNameMiddle && isAliveNameLast && isDeadNameLast) {
        let fullAlive = `${aliveName.first} ${aliveName.middle} ${aliveName.last}`, fullDead = `${deadName[x].first} ${deadName[x].middle} ${deadName[x].last}`;
        newWords.push(fullAlive), oldWords.push(fullDead);
      }
      isAliveNameFirst && isDeadNameFirst && (newWords.push(aliveName.first), oldWords.push(deadName[x].first)), isDeadNameMiddle && (newWords.push(isAliveNameMiddle ? aliveName.middle : ""), oldWords.push(deadName[x].middle)), isAliveNameLast && isDeadNameLast && (newWords.push(aliveName.last), oldWords.push(deadName[x].last)), isAliveNameFirst && isDeadNameFirst && isAliveNameLast && isDeadNameLast && (newWords.push(aliveName.first + aliveName.last), oldWords.push(deadName[x].first + deadName[x].last));
    }
  }
  var acceptableCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
  function replaceText(text, isTitle) {
    let currentIndex = 0, index, end, getIndex = (searchString, position) => index = (ignoreCase ? text.toLowerCase() : text).indexOf(searchString, position), getNextIndex = (position) => {
      for (index = getIndex(oldWords[currentIndex], position); index === -1; ) {
        if (currentIndex + 1 === oldWords.length)
          return !1;
        currentIndex++, index = getIndex(oldWords[currentIndex]);
      }
      return !0;
    };
    ignoreCase && (oldWords = oldWords.map((oldText) => oldText.toLowerCase())), highlight && !isTitle && (revert ? oldWords = oldWords.map((text2) => `<mark replaced="">${text2}</mark>`) : newWords = newWords.map((text2) => text2.includes("replaced") ? text2 : `<mark replaced="">${text2}</mark>`));
    let oldTextsLen = oldWords.map((word) => word.length);
    for (; getNextIndex(end); )
      end = index + oldTextsLen[currentIndex], acceptableCharacters.indexOf(text[end]) === -1 && acceptableCharacters.indexOf(text[index - 1]) === -1 && (text = text.substring(0, index) + newWords[currentIndex] + text.substring(end));
    return text;
  }
  function checkNodeForReplacement(node) {
    if (!(!node || !revert && node.replaced)) {
      if (revert) {
        if (highlight) {
          let cachedText = cachedWords.get(node.innerHTML);
          cachedText && (node.innerHTML = cachedText.toString());
        } else {
          let cachedText = cachedWords.get(node.nodeValue);
          cachedText && node.parentElement && node.parentElement.replaceChild(document.createTextNode(cachedText.toString()), node);
        }
        return;
      }
      if (node.nodeType === 3) {
        let oldText = node.nodeValue, newText = node.nodeValue;
        newText = replaceText(newText, !1), newText !== oldText && (cachedWords.set(newText, oldText), node.parentElement && (node.parentElement.innerHTML = newText));
      } else if (node.hasChildNodes())
        for (let i = 0, len = node.childNodes.length; i < len; i++)
          checkNodeForReplacement(node.childNodes[i]);
    }
  }
  function setupListener() {
    observer = new MutationObserver((mutations) => {
      for (let i = 0, len = mutations.length; i < len; i++) {
        let mutation = mutations[i];
        mutation.type === "childList" && mutation.addedNodes.forEach((node) => {
          checkNodeForReplacement(node);
        });
      }
    }), observer.observe(document, { childList: !0, subtree: !0 });
  }
  function checkElementForTextNodes() {
    if (revert && highlight) {
      let elements = document.body.querySelectorAll("mark[replaced]");
      for (let i = 0, len = elements.length; i < len; i++)
        checkNodeForReplacement(elements[i].parentElement);
    }
    let iterator = document.createNodeIterator(document.body, NodeFilter.SHOW_TEXT), currentTextNode;
    for (; currentTextNode = iterator.nextNode(); )
      checkNodeForReplacement(currentTextNode);
    !revert && setupListener();
  }
  function replaceDOMWithNewWords() {
    document.title = replaceText(document.title, !0), domAction(() => checkElementForTextNodes());
  }
  return __toCommonJS(inject_exports);
})();
