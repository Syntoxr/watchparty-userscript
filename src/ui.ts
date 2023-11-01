import uiHtml from "./html/ui.html";
import { SocketStates } from "./socket";

document.body.insertAdjacentHTML("beforeend", uiHtml);

enum GmValues {
  url = "WP_URL",
  token = "WP_TOKEN",
  roomName = "WP_ROOM_NAME",
  roomPassword = "WP_ROOM_PASSWORD",
}

export class Ui {
  serverUrl: string;
  serverToken: string;
  roomName: string;
  roomPassword: string;

  private mouseTimer = setTimeout(() => {}, 5000);

  private htmlElements = {
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

  constructor() {
    this.initValues();
    this.updateSubmitButtonAvailability();
    //update submit button availability on every form input
    this.htmlElements.configForm
      .querySelectorAll("input")
      .forEach((element) => {
        element.oninput = () => {
          this.updateSubmitButtonAvailability();
        };
      });

    /**
     * hide ui when mouse does not move
     */

    //clear timer if ui was opend and start if ui was closed by clicking
    this.htmlElements.inputToggle.addEventListener("click", (event) => {
      clearTimeout(this.mouseTimer);
      if (this.htmlElements.inputToggle.checked == false) {
        this.mouseTimer = setTimeout(
          () => (this.htmlElements.ui.style.opacity = "0%"),
          2e3,
        );
      }
    });

    //stop and restart timer on mouse move until ui gest opened
    document.addEventListener("mousemove", () => {
      this.htmlElements.ui.style.opacity = "100%";
      clearTimeout(this.mouseTimer);
      if (!this.htmlElements.inputToggle.checked) {
        this.mouseTimer = setTimeout(
          () => (this.htmlElements.ui.style.opacity = "0%"),
          2e3,
        );
      }
    });

    /**
     * Handle click on submit button
     */
    this.htmlElements.configForm.addEventListener("submit", (event) => {
      //prevent the standard behaviour of submitting the form via http request
      event.preventDefault();
      const newUrl = this.htmlElements.inputUrl.value;
      const newToken = this.htmlElements.inputToken.value;
      const newRoomName = this.htmlElements.inputRoomName.value;
      const newRoomPassword = this.htmlElements.inputRoomPassword.value;

      const updateValues = () => {
        this.serverUrl = newUrl;
        this.serverToken = newToken;
        this.roomName = newRoomName;
        this.roomPassword = newRoomPassword;

        //save credentials into userscript manager
        GM.setValue(GmValues.url, newUrl);
        GM.setValue(GmValues.token, newToken);
        GM.setValue(GmValues.roomName, newRoomName);
        GM.setValue(GmValues.roomPassword, newRoomPassword);
      };

      //create new socket if url or token changed or socket not connected. Join specified room otherwise
      if (newUrl !== this.serverUrl || newToken !== this.serverToken) {
        updateValues();
        this.onServerDetailsChanged();
      } else if (
        newRoomName !== this.roomName ||
        newRoomPassword !== this.roomPassword
      ) {
        updateValues();
        this.onRoomDetailsChanged();
      }
    });
  }

  private async initValues() {
    this.serverUrl = await GM.getValue(GmValues.url, "");
    this.serverToken = await GM.getValue(GmValues.token, "");
    this.roomName = await GM.getValue(GmValues.roomName, "");
    this.roomPassword = await GM.getValue(GmValues.roomPassword, "");
    this.htmlElements.inputUrl.value = this.serverUrl;
    this.htmlElements.inputToken.value = this.serverToken;
    this.htmlElements.inputRoomName.value = this.roomName;
    this.htmlElements.inputRoomPassword.value = this.roomPassword;
  }

  //Enables / disables the submit button based on the form validity
  private updateSubmitButtonAvailability() {
    if (this.htmlElements.configForm.checkValidity() == false) {
      this.htmlElements.submitButton.disabled = true;
    } else this.htmlElements.submitButton.disabled = false;
  }

  /**
   * Set background color based on connection state
   */
  public setColor(state: "active" | "inactive") {
    if (state === "active") {
      this.htmlElements.ui.style.backgroundColor = "#91BD3A";
    } else {
      this.htmlElements.ui.style.backgroundColor = "#FA4252";
    }
  }

  /**
   * used to externally set the room name displayed in the UI
   * @param name room name
   */
  public setUiRoomName(name: string) {
    this.htmlElements.inputRoomName.value = name;
    GM.setValue(GmValues.roomName, name);
    this.roomName = name;
  }

  public onServerDetailsChanged() {}

  public onRoomDetailsChanged() {}
}

/**
 * on submit
 */

// htmlElements.configForm.onsubmit = (event) => {
//   event.preventDefault();
//   const newUrl = htmlElements.inputUrl.value;
//   const newToken = htmlElements.inputToken.value;
//   const newRoomName = htmlElements.inputRoomName.value;
//   const newRoomPassword = htmlElements.inputRoomPassword.value;

//   //create new socket if url or token changed or socket not connected. Join specified room otherwise
//   if (
//     newUrl !== url ||
//     newToken !== token ||
//     socketState !== SocketStates.connected
//   ) {
//     initSocket(newUrl, newToken).then(() => {
//       joinRoom(newRoomName, newRoomPassword).then((msg) => {
//         htmlElements.inputRoomName.value = msg.name;
//       });
//     });
//   } else {
//     joinRoom(newRoomName, newRoomPassword).then((msg) => {
//       htmlElements.inputRoomName.value = msg.name;
//     });
//   }

//   url = newUrl;
//   token = newToken;
//   roomName = newRoomName;
//   roomPassword = newRoomPassword;

//   GM.setValue(GmValues.url, newUrl);
//   GM.setValue(GmValues.token, newToken);
//   GM.setValue(GmValues.roomName, newRoomName);
//   GM.setValue(GmValues.roomPassword, newRoomPassword);
// };
