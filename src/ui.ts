import uiHtml from "./html/ui.html";
import styles from "./style/main.less";
import { WPSocket, SocketStates } from "./socket";
import { makeDraggable } from "./util/makeDraggable";
import { getCurrentSite } from "./util/sites";

enum GmValues {
  url = "WP_URL",
  token = "WP_TOKEN",
  roomName = "WP_ROOM_NAME",
  roomPassword = "WP_ROOM_PASSWORD",
  uiPositions = "WP_UI_POSITIONS",
}

interface UiPosition {
  top: number;
  right: number;
}

interface SiteBasedUiPositions {
  [key: string]: UiPosition;
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
  wpSocket: WPSocket;
  constructor(wpSocket: WPSocket) {
    this.wpSocket = wpSocket;
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
        this.wpSocket.state !== SocketStates.connected
      ) {
        this.wpSocket.initSocket(newUrl, newToken, this).then(() => {
          this.wpSocket.joinRoom(newRoomName, newRoomPassword).then((msg) => {
            this.htmlElements.inputRoomName.value = msg.name;
          });
        });
      } else {
        this.wpSocket.joinRoom(newRoomName, newRoomPassword).then((msg) => {
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

    // Get and apply the current UI position from GM
    GM.getValue(GmValues.uiPositions, "{}").then((positionsValue: string) => {
      const position = JSON.parse(positionsValue)[
        getCurrentSite().toString()
      ] as UiPosition; // Parse the positions
      if (position) {
        if (window.innerWidth - position.right < 40) position.right = 10; // Check if the right position is out of bounds
        if (window.innerHeight - position.top < 40) position.top = 10; // Check if the top position is out of bounds

        shadowHost.style.top = `${position.top}px`; // Set the top position
        shadowHost.style.right = `${position.right}px`; // Set the right position
      } else {
        shadowHost.style.top = `10px`; // Set the top position
        shadowHost.style.right = `10px`; // Set the right position
      }
    });

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

    makeDraggable(shadowHost);

    // Handle the dragend event, saving the new UI position
    shadowHost.addEventListener("dragend", (e: CustomEvent) => {
      const newPosition: UiPosition = e.detail as UiPosition; // Get the new position from the event
      GM.getValue(GmValues.uiPositions, "{}") // Get the current UI positions from GM
        .then((positionsValue: string) => {
          const positions = JSON.parse(positionsValue) as SiteBasedUiPositions; // Parse the positions
          positions[getCurrentSite().toString()] = newPosition; // Update the position for the current site
          GM.setValue(GmValues.uiPositions, JSON.stringify(positions)); // Save the updated positions to GM
        });
    });

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
