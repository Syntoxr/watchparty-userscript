import uiHtml from "./html/ui.html";
import { initSocket, socketState, SocketStates, joinRoom } from "./socket";

document.body.insertAdjacentHTML("beforeend", uiHtml);

enum GmValues {
  url = "WP_URL",
  token = "WP_TOKEN",
  roomName = "WP_ROOM_NAME",
  roomPassword = "WP_ROOM_PASSWORD",
}

let url = await GM.getValue(GmValues.url, "");
let token = await GM.getValue(GmValues.token, "");
let roomName = await GM.getValue(GmValues.roomName, "");
let roomPassword = await GM.getValue(GmValues.roomPassword, "");

const htmlElements = {
  ui: document.getElementById("wp-ui"),
  configForm: document.getElementById("wp-config-form") as HTMLFormElement,
  inputToggle: document.getElementById(
    "collapsible-toggle",
  ) as HTMLInputElement,
  inputUrl: document.getElementById("wp-url-input") as HTMLInputElement,
  inputToken: document.getElementById("wp-token-input") as HTMLInputElement,
  inputRoomName: document.getElementById(
    "wp-room-name-input",
  ) as HTMLInputElement,
  inputRoomPassword: document.getElementById(
    "wp-room-password-input",
  ) as HTMLInputElement,
  submitButton: document.getElementById(
    "wp-submit-button",
  ) as HTMLButtonElement,
};

htmlElements.inputUrl.value = url;
htmlElements.inputToken.value = token;
htmlElements.inputRoomName.value = roomName;
htmlElements.inputRoomPassword.value = roomPassword;

/**
 * Enable or disable submit button based on form validity
 */
function manageSubmitActivation() {
  if (htmlElements.configForm.checkValidity() == false) {
    htmlElements.submitButton.disabled = true;
  } else htmlElements.submitButton.disabled = false;
}
manageSubmitActivation();

htmlElements.configForm.querySelectorAll("input").forEach((element) => {
  element.oninput = () => {
    manageSubmitActivation();
  };
});

/**
 * hide when no mouse movement
 */
let mouseTimer = setTimeout(() => {}, 5000);

htmlElements.inputToggle.addEventListener("click", (event) => {
  clearTimeout(mouseTimer);
  if (htmlElements.inputToggle.checked == false) {
    mouseTimer = setTimeout(() => (htmlElements.ui.style.opacity = "0%"), 2e3);
  }
});

document.addEventListener("mousemove", () => {
  htmlElements.ui.style.opacity = "100%";
  clearTimeout(mouseTimer);
  if (!htmlElements.inputToggle.checked) {
    mouseTimer = setTimeout(() => (htmlElements.ui.style.opacity = "0%"), 2e3);
  }
});

/**
 * Set background color based on connection state
 */

export function setColor(state: "active" | "inactive") {
  if (state === "active") {
    htmlElements.ui.style.backgroundColor = "#91BD3A";
  } else {
    htmlElements.ui.style.backgroundColor = "#FA4252";
  }
}

/**
 * used to externally set the room name
 * @param name room name
 */
export function setUiRoomName(name: string) {
  htmlElements.inputRoomName.value = name;
  GM.setValue(GmValues.roomName, name);
  roomName = name;
}

/**
 * om submit
 */

htmlElements.configForm.onsubmit = (event) => {
  event.preventDefault();
  const newUrl = htmlElements.inputUrl.value;
  const newToken = htmlElements.inputToken.value;
  const newRoomName = htmlElements.inputRoomName.value;
  const newRoomPassword = htmlElements.inputRoomPassword.value;

  //create new socket if url or token changed or socket not connected. Join specified room otherwise
  if (
    newUrl !== url ||
    newToken !== token ||
    socketState !== SocketStates.connected
  ) {
    initSocket(newUrl, newToken).then(() => {
      joinRoom(newRoomName, newRoomPassword).then((msg) => {
        htmlElements.inputRoomName.value = msg.name;
      });
    });
  } else {
    joinRoom(newRoomName, newRoomPassword).then((msg) => {
      htmlElements.inputRoomName.value = msg.name;
    });
  }

  url = newUrl;
  token = newToken;
  roomName = newRoomName;
  roomPassword = newRoomPassword;

  GM.setValue(GmValues.url, newUrl);
  GM.setValue(GmValues.token, newToken);
  GM.setValue(GmValues.roomName, newRoomName);
  GM.setValue(GmValues.roomPassword, newRoomPassword);
};
