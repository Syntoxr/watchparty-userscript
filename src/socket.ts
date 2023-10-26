import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import "./mediaplayer";
import { MediaPlayer, getMediaPlayer } from "./mediaplayer";
import { setColor as setUiColor } from "./ui";

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

export let socket: Socket;

/**
 * @param name
 * @param password
 * @returns Promise with response of request
 */
export function joinRoom(name: string, password: string): Promise<any> {
  //if socket not created or not connected return rejected promise instead of joining
  if (!socket?.connected) {
    console.warn("socket not ready (yet)");
    return new Promise((resolve, reject) => reject("socket not ready yet"));
  }
  console.log("joining" + name);
  const response = socket.emitWithAck(SocketEvents.joinRoom, {
    name: name,
    password: password,
  });
  return response;
}

function handleRemoteAction(msg: any, mediaplayer: MediaPlayer) {}

export let socketState: SocketStates = SocketStates.disconnected;

/**
 * Inits new socket and closes old one
 * @param url
 * @param token
 * @returns
 */
export async function initSocket(url: string, token: string): Promise<void> {
  return new Promise<void>((resolve) => {
    //close old socket if exists
    if (socket) socket.close();

    socket = io(url, {
      extraHeaders: {
        authorization: token,
      },
    });

    socket.on(SocketEvents.connect, async () => {
      setUiColor("active");
      console.log("Socket connected as: " + socket.id);
      socketState = SocketStates.connected;

      const mediaplayer = await getMediaPlayer().catch((error) => {
        socket.close();
        throw error;
      });

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
        socket.emit(SocketEvents.action, { action: SocketActions.play });
      };

      mediaplayer.onPause = () => {
        if (ignoreNextAction) {
          ignoreNextAction = false;
          return;
        }
        socket.emit(SocketEvents.action, { action: SocketActions.pause });
      };

      mediaplayer.onSetTime = (time) => {
        if (ignoreNextAction) {
          ignoreNextAction = false;
          return;
        }
        socket.emit(SocketEvents.action, {
          action: SocketActions.setTime,
          time: time,
        });
      };

      socket.on(SocketEvents.action, (msg) => {
        ignoreNextAction = true;
        handleRemoteAction(msg, mediaplayer);
      });
      resolve();
    });

    socket.on(SocketEvents.disconnect, () => {
      setUiColor("inactive");
      console.log("disconnected Socket");
      socketState = SocketStates.disconnected;
    });
  });
}
