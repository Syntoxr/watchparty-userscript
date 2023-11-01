import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import "./mediaplayer";
import { MediaPlayer } from "./mediaplayer";
import { Ui } from "./ui";

export enum SocketEvents {
  connect = "connect",
  disconnect = "disconnect",
  joinRoom = "joinRoom",
  action = "action",
}

export enum SocketStates {
  connecting,
  connected,
  ready,
  disconnected,
}

enum SocketActions {
  play = "PLAY",
  pause = "PAUSE",
  setTime = "SET_TIME",
}

export class WpSocket {
  socketState = SocketStates.disconnected;
  private socket: Socket;
  constructor(
    url: string,
    token: string,
    public mediaplayer: MediaPlayer,
    public ui: Ui,
  ) {
    this.socket = io(url, {
      extraHeaders: {
        authorization: token,
      },
    });

    //Socket listeners
    this.socket.on(SocketEvents.connect, async () => {
      this.ui.setColor("active");
      console.log("Socket connected as: " + this.socket.id);
      this.socketState = SocketStates.connected;

      //in case the last action was triggered remotely
      let ignoreNextAction = false;

      /**
       * Mediaplayer listeners
       */
      mediaplayer.onPlay = () => {
        if (ignoreNextAction) {
          ignoreNextAction = false;
          return;
        }
        this.socket.emit(SocketEvents.action, { action: SocketActions.play });
      };

      mediaplayer.onPause = () => {
        if (ignoreNextAction) {
          ignoreNextAction = false;
          return;
        }
        this.socket.emit(SocketEvents.action, { action: SocketActions.pause });
      };

      mediaplayer.onSetTime = (time) => {
        if (ignoreNextAction) {
          ignoreNextAction = false;
          return;
        }
        this.socket.emit(SocketEvents.action, {
          action: SocketActions.setTime,
          time: time,
        });
      };

      this.socket.on(SocketEvents.action, (msg) => {
        ignoreNextAction = true;
        switch (msg.action) {
          case "PLAY":
            mediaplayer.play();
            break;
          case "PAUSE":
            mediaplayer.pause();
            break;

          default:
            break;
        }
      });
    });

    this.socket.on(SocketEvents.disconnect, () => {
      this.ui.setColor("inactive");
      console.log("disconnected Socket");
      this.socketState = SocketStates.disconnected;
    });
  }

  /**
   * @param name
   * @param password
   * @returns Promise with response of request
   */
  joinRoom(name: string, password: string) {
    //if socket not created or not connected return rejected promise instead of joining
    if (!this.socket?.connected) {
      console.warn("socket not ready (yet)");
      return new Promise((resolve, reject) => reject("socket not ready yet"));
    }
    console.log("joining " + name);
    const response = this.socket.emitWithAck(SocketEvents.joinRoom, {
      name: name,
      password: password,
    });

    response.then((msg) => {
      this.ui.setUiRoomName(msg.name);
    });
  }

  public close() {
    this.socket.close();
  }
}
