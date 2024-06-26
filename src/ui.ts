import uiHtml from "./html/ui.html";
import styles from "./style/main.less";
import { initSocket, socketState, SocketStates, joinRoom } from "./socket";

enum GmValues {
  url = "WP_URL",
  token = "WP_TOKEN",
  roomName = "WP_ROOM_NAME",
  roomPassword = "WP_ROOM_PASSWORD",
}

interface HtmlElements {
  ui: HTMLElement;
  configForm: HTMLFormElement;
  inputToggle: HTMLInputElement;
  inputUrl: HTMLInputElement;
  inputToken: HTMLInputElement;
  inputRoomName: HTMLInputElement;
  inputRoomPassword: HTMLInputElement;
  submitButton: HTMLButtonElement;
}

export class UI {
  htmlElements: HtmlElements;
  url: string;
  token: string;
  roomName: string;
  roomPassword: string;
  constructor() {
    this.htmlElements = this.createOverlay();

    this.applySavedSettings();
    /**
     * Enable or disable submit button based on form validity
     */
    this.htmlElements.configForm
      .querySelectorAll("input")
      .forEach((element) => {
        element.oninput = () => {
          this.updateSubmitActivation();
        };
      });

    /**
     * only show on mouse movement
     */
    let mouseTimer = setTimeout(() => {}, 5000);

    this.htmlElements.inputToggle.addEventListener("click", (event) => {
      clearTimeout(mouseTimer);
      if (this.htmlElements.inputToggle.checked == false) {
        mouseTimer = setTimeout(
          () => (this.htmlElements.ui.style.opacity = "0%"),
          2e3,
        );
      }
    });

    document.addEventListener("mousemove", () => {
      this.htmlElements.ui.style.opacity = "100%";
      clearTimeout(mouseTimer);
      if (!this.htmlElements.inputToggle.checked) {
        mouseTimer = setTimeout(
          () => (this.htmlElements.ui.style.opacity = "0%"),
          2e3,
        );
      }
    });
    /**
     * on submit
     */

    this.htmlElements.configForm.onsubmit = (event) => {
      event.preventDefault();
      const newUrl = this.htmlElements.inputUrl.value;
      const newToken = this.htmlElements.inputToken.value;
      const newRoomName = this.htmlElements.inputRoomName.value;
      const newRoomPassword = this.htmlElements.inputRoomPassword.value;

      //create new socket if url or token changed or socket not connected. Join specified room otherwise
      if (
        newUrl !== this.url ||
        newToken !== this.token ||
        socketState !== SocketStates.connected
      ) {
        initSocket(newUrl, newToken, this).then(() => {
          joinRoom(newRoomName, newRoomPassword).then((msg) => {
            this.htmlElements.inputRoomName.value = msg.name;
          });
        });
      } else {
        joinRoom(newRoomName, newRoomPassword).then((msg) => {
          this.htmlElements.inputRoomName.value = msg.name;
        });
      }

      this.url = newUrl;
      this.token = newToken;
      this.roomName = newRoomName;
      this.roomPassword = newRoomPassword;

      GM.setValue(GmValues.url, newUrl);
      GM.setValue(GmValues.token, newToken);
      GM.setValue(GmValues.roomName, newRoomName);
      GM.setValue(GmValues.roomPassword, newRoomPassword);
    };
  }

  private createOverlay(): HtmlElements {
    // Create a container for the Shadow DOM
    const shadowHost = document.createElement("div");
    shadowHost.id = "wp-shadow-host";
    shadowHost.style.position = "fixed";
    shadowHost.style.top = "10px";
    shadowHost.style.right = "10px";
    shadowHost.style.zIndex = "10000"; // Ensure it's on top
    shadowHost.style.pointerEvents = "none"; // Allow interaction with underlying elements

    // Attach a shadow root to the shadow host
    const shadowRoot = shadowHost.attachShadow({ mode: "open" });

    // Create the overlay div inside the shadow root
    const overlay = document.createElement("div");
    overlay.innerHTML = uiHtml;
    overlay.style.pointerEvents = "auto"; // Allow interaction with the overlay itself

    // Create a style element and add the compiled CSS
    const style = document.createElement("style");
    style.textContent = styles[0][1];

    // Append the style and overlay to the shadow root
    shadowRoot.appendChild(style);
    shadowRoot.appendChild(overlay);

    // Append the shadow host to the document body
    document.body.appendChild(shadowHost);

    return {
      ui: shadowRoot.getElementById("wp-ui"),
      configForm: shadowRoot.getElementById(
        "wp-config-form",
      ) as HTMLFormElement,
      inputToggle: shadowRoot.getElementById(
        "collapsible-toggle",
      ) as HTMLInputElement,
      inputUrl: shadowRoot.getElementById("wp-url-input") as HTMLInputElement,
      inputToken: shadowRoot.getElementById(
        "wp-token-input",
      ) as HTMLInputElement,
      inputRoomName: shadowRoot.getElementById(
        "wp-room-name-input",
      ) as HTMLInputElement,
      inputRoomPassword: shadowRoot.getElementById(
        "wp-room-password-input",
      ) as HTMLInputElement,
      submitButton: shadowRoot.getElementById(
        "wp-submit-button",
      ) as HTMLButtonElement,
    };
  }
  private async applySavedSettings() {
    this.url = await GM.getValue(GmValues.url, "");
    this.token = await GM.getValue(GmValues.token, "");
    this.roomName = await GM.getValue(GmValues.roomName, "");
    this.roomPassword = await GM.getValue(GmValues.roomPassword, "");

    this.htmlElements.inputUrl.value = this.url;
    this.htmlElements.inputToken.value = this.token;
    this.htmlElements.inputRoomName.value = this.roomName;
    this.htmlElements.inputRoomPassword.value = this.roomPassword;
    this.updateSubmitActivation();
  }

  private updateSubmitActivation() {
    if (this.htmlElements.configForm.checkValidity() == false) {
      this.htmlElements.submitButton.disabled = true;
    } else this.htmlElements.submitButton.disabled = false;
  }

  /**
   * Set background color based on connection state
   */
  setColor(state: "active" | "inactive") {
    if (state === "active") {
      this.htmlElements.ui.style.backgroundColor = "#91BD3A";
    } else {
      this.htmlElements.ui.style.backgroundColor = "#FA4252";
    }
  }

  /**
   * used to externally set the room name
   * @param name room name
   */
  public setUiRoomName(name: string) {
    this.htmlElements.inputRoomName.value = name;
    GM.setValue(GmValues.roomName, name);
    this.roomName = name;
  }
}
