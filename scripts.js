window.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var WELCOME_MSG = "*hello*";

  var mainDiv = document.querySelector(".main");
  var textDiv = document.querySelector(".text");
  var inputField = document.querySelector(".inputbox");
  var shareLinkField = document.querySelector(".js-share-link");
  var charboxTemplate = document.querySelector("#charbox-template");
  var defaultTitle = document.querySelector("title").innerText;

  var isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  function updateFragment(text) {
    // Don't spam the browser history & strip query strings.
    window.location.replace(location.origin + "/#" + encodeURIComponent(text));
    shareLinkField.value = location.origin + "/" + location.hash;
  }

  function updateTitle(text) {
    if (!text || text === WELCOME_MSG) {
      document.title = defaultTitle;
    } else {
      document.title = text;
    }
  }

  function clearChars() {
    while (textDiv.firstChild) {
      textDiv.removeChild(textDiv.firstChild);
    }
  }

  function renderText() {
    // Return a space as typing indicator if text is empty.
    var text = decodeURIComponent(location.hash.split("#")[1] || " ");
    var fontSize = Math.min(150 / text.length, 30);

    clearChars();

    text.split(/.*?/u).forEach(function (chr) {
      var charbox = charboxTemplate.content.cloneNode(true);
      var charElem = charbox.querySelector(".char");
      charElem.style.fontSize = fontSize + "vw";

      if (chr !== " ") {
        charElem.textContent = chr;
      } else {
        charElem.innerHTML = "&nbsp;";
      }

      if (chr.match(/[0-9]/i)) {
        charElem.className = "number";
      } else if (!chr.match(/\p{L}/iu)) {
        charElem.className = "symbol";
      }

      textDiv.appendChild(charbox);
    });

    // Ignore the placeholder space (typing indicator).
    if (text === " ") {
      text = "";
    }

    // Don't jump the cursor to the end
    if (inputField.value !== text) {
      inputField.value = text;
    }
    updateFragment(text);
    updateTitle(text);
  }

  function onInput(evt) {
    updateFragment(evt.target.value);
  }

  function enterInputMode(evt) {
    var defaultHash = "#" + encodeURIComponent(WELCOME_MSG);
    if (location.hash === defaultHash) {
      updateFragment("");
      renderText();
    }
    inputField.focus();
  }

  function modalKeyHandler(sel, evt) {
    // ESC to close the modal
    if (evt.keyCode === 27) {
      hideModal(sel);
    }
  }

  function showModal(sel) {
    window.removeEventListener("keypress", enterInputMode);
    var modalDiv = document.querySelector(sel);
    modalDiv.classList.add("open");
    mainDiv.classList.add("blurred");
    var closeBtn = modalDiv.querySelector(".js-modal-close");

    // Use legacy event handling to avoid having to unregister handlers
    closeBtn.onclick = hideModal.bind(null, sel);
    window.onkeydown = modalKeyHandler.bind(null, sel);

    // Make sure we're scrolled to the top on mobile
    modalDiv.scrollTop = 0;

    ga("send", "event", "modal-show", sel);
  }

  function hideModal(sel) {
    var modalDiv = document.querySelector(sel);
    modalDiv.classList.remove("open");
    mainDiv.classList.remove("blurred");
    window.onkeydown = null;
    window.addEventListener("keypress", enterInputMode, false);
  }

  document.querySelector(".js-help-button").addEventListener(
    "click",
    function (evt) {
      evt.preventDefault();
      showModal(".js-help-modal");
    },
    false
  );

  document.querySelector(".js-share-button").addEventListener(
    "click",
    function (evt) {
      evt.preventDefault();
      let url = document.location.href;

      navigator.clipboard.writeText(url).then(
        function () {
          console.log("Copied!");
        },
        function () {
          console.log("Copy error");
        }
      );
      // Don't pop up the keyboard on mobile
      if (!isMobile) {
        shareLinkField.select();
      }
    },
    false
  );

  inputField.addEventListener("input", onInput, false);
  textDiv.addEventListener("click", enterInputMode, false);
  window.addEventListener("keypress", enterInputMode, false);
  window.addEventListener("hashchange", renderText, false);

  if (!location.hash) {
    updateFragment(WELCOME_MSG);
  }

  renderText();
});
