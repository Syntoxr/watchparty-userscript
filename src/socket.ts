import { io, Socket } from "socket.io-client";
import type { MediaPlayer } from "./mediaplayers/mediaplayer";
import type { UI } from "./ui";

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

export class WPSocket {
  private socket: Socket;
  state: SocketStates;
  private mediaplayer: MediaPlayer;

  constructor(mediaplayer: MediaPlayer) {
    this.mediaplayer = mediaplayer;
    this.state = SocketStates.disconnected;
  }

  /**
   * @param name
   * @param password
   * @returns Promise with response of request
   */
  joinRoom(name: string, password: string): Promise<any> {
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
    return response;
  }

  private handleRemoteAction(msg: any) {
    switch (msg.action) {
      case "PLAY":
        this.mediaplayer.play();
        break;
      case "PAUSE":
        this.mediaplayer.pause();
        break;

      default:
        break;
    }
  }

  /**
   * Inits new socket and closes old one
   * @param url
   * @param token
   * @returns
   */
  public async initSocket(url: string, token: string, ui: UI): Promise<void> {
    return new Promise<void>((resolve) => {
      //close old socket if exists
      if (this.socket) this.socket.close();

      this.socket = io(url, {
        extraHeaders: {
          authorization: token,
        },
      });

      this.socket.on(SocketEvents.connect, async () => {
        ui.setColor("active");
        console.log("Socket connected as: " + this.socket.id);
        this.state = SocketStates.connected;

        //in case the last action was triggered remotely
        let ignoreNextAction = false;

        /**
         * Mediaplayer listeners
         */
        this.mediaplayer.onPlay = () => {
          if (ignoreNextAction) {
            ignoreNextAction = false;
            return;
          }
          this.socket.emit(SocketEvents.action, { action: SocketActions.play });
        };

        this.mediaplayer.onPause = () => {
          if (ignoreNextAction) {
            ignoreNextAction = false;
            return;
          }
          this.socket.emit(SocketEvents.action, {
            action: SocketActions.pause,
          });
        };

        this.mediaplayer.onSetTime = (time) => {
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
          this.handleRemoteAction(msg);
        });
        resolve();
      });

      this.socket.on(SocketEvents.disconnect, () => {
        ui.setColor("inactive");
        console.log("disconnected Socket");
        this.state = SocketStates.disconnected;
      });
    });
  }
}
