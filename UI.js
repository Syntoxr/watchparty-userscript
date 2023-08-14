// ==UserScript==
// @name        Watchparty
// @namespace   Violentmonkey Scripts
// @match       https://www.netflix.com/watch/*
// @match       https://www.startpage.com/*
// @grant       none
// @version     1.0
// @author      Syntox
// @description sync player state
// ==/UserScript==

wpVisible = false;
expandContainerVisible = false;
expandContainer = /*html*/ `
<div id="wp-expand-container">
  <div class="wp-container">
    <div>
      <input type="text" class="wp-input wp-pixeled" placeholder="server URL" id="wp-urlInput" name="wp-urlInput">
      <label for="wp-urlInput">input URL of backend server</label>
    </div>
      <button id="wp-setButton" type="button" class="wp-pixeled wp-button">Set URL</button>
  </div>

  <div class="wp-container">
    <div class="wp-input-container">
      <input id="wp-roomInput" type="text" class="wp-input wp-pixeled" placeholder="room name" name="wp-roomInput">
      <label for="wp-roomInput">leave blank to create room</label>
    </div>
      <button id="wp-joinCreateButton" type="button" class="wp-pixeled wp-button">Join/Create room</button>
  </div>
</div>
    
`;

popup = /*html*/ `
<div id="wp-popup-container" class="wp-hidden wp-pixeled">
  <button id="wp-expand-button" type="button" class="wp-pixeled wp-button" >WP</button>

  

</div>
<style>
  #wp-popup-container {
    position: fixed;
    z-index: 420;
    top: 20px;
    right: 20px;
    padding: 0px;
    padding-bottom: 0;
    background-color: #303030;
    box-shadow: 3px 3px 0px rgba(0, 0, 0, 0.75);
    overflow: hidden;
    border: 0;
  }

  #wp-expand-button {
    float: right;
  }

  .wp-expand-container {
    display: none;
    overflow: hidden;
  }

  .wp-pixeled {
      border: 3px solid #000000;
      font-size: 14px;
      font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol',sans-serif;
  }

  .wp-input {
    display: block;
  }

  .wp-input:focus {
    outline: 2px solid #444444;
  }

  .wp-button {
    box-shadow: 3px 3px 0px rgba(0, 0, 0, 0.75);
    flex: 1;
  }

  .wp-button:hover {
    background-color: #dddddd;
  }

  .wp-button:active {
    box-shadow: 0px 0px 0px;
    transform: translate(3px, 3px);
  }


  .wp-input,
  .wp-button {
      height: 30px;
  }

  .wp-visible {
    height: auto;
    width: auto;
    visibility: visible;
    opacity: 1;
    transition: opacity 0.2s linear;
  }

  .wp-hidden {
    height: 0;
    width: 0;
    visibility: hidden;
    opacity: 0;
    transition: visibility 0s 2s, opacity 2s linear;
  }

  .wp-container {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      width: 400px; /* Adjust the width as needed */
  }

  .wp-container label {
    margin-right: 1px;
    font-size: 10px;
    float: right;
  }
</style>
`;
document.body.insertAdjacentHTML("afterbegin", popup);

/**
 * logic
 */

document.getElementById("wp-expand-button").onclick = () => {
  const popupContainer = document.getElementById("wp-popup-container");
  if (expandContainerVisible) {
    popupContainer.removeChild(document.getElementById("wp-expand-container"));
    popupContainer.style.border = "none";
  } else {
    popupContainer.insertAdjacentHTML("beforeend", expandContainer);
    popupContainer.style.border = "3px solid black";
  }
  expandContainerVisible = !expandContainerVisible;
};

function showPopupContainer() {
  document
    .getElementById("wp-popup-container")
    .classList.replace("wp-hidden", "wp-visible");
}
function hidePopupContainer() {
  document
    .getElementById("wp-popup-container")
    .classList.replace("wp-visible", "wp-hidden");
}

document.addEventListener("mousemove", showPopupContainer);
