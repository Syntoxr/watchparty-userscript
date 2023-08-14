url = "https://watchparty.example.com";
token = "123456789";
ignoreNextEvent = false;
currentRoom = "";

function waitForElement(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

async function loadMediaPlayer() {
  const host = window.location.host;
  let mediaplayer = null;
  switch (host) {
    case "www.netflix.com":
      video = await waitForElement("video");
      mediaplayer = video;
      mediaplayer.pause();
      break;

    default:
      break;
  }

  return mediaplayer;
}

/** Socket Initialization
 *
 * @param {*} bd - base domain of backend
 * @param {*} t - token
 * @returns
 */
async function initSocket(bd, t) {
  script = document.body.appendChild(document.createElement("script"));
  script.src = `${bd}/socket.io/socket.io.js`;

  await new Promise((resolve) => (script.onload = () => resolve()));
  console.log("script loaded");
  socket = await io(bd, {
    extraHeaders: {
      authorization: t,
    },
  });

  await new Promise((resolve) => socket.on("connect", () => resolve()));

  return socket;
}

/** create socket room
 *
 * @param {socket} socket - websocket connection
 */
function createRoom(socket) {
  return new Promise((resolve) =>
    socket.emit("createRoom", "", (msg) => {
      currentRoom = msg.name;
      resolve(msg.name);
    })
  );
}

/** join socket room
 *
 * @param {socket} socket - websocket connection
 * @param {string} room - room name
 */
function joinRoom(socket, room) {
  return new Promise((resolve, reject) =>
    socket.emit("joinRoom", "", (msg) => {
      if (msg.status == "error") {
        console.error(msg.message);
        reject();
        return;
      }
      currentRoom = room;
      resolve();
    })
  );
}

function registerEvents(socket, mediaplayer) {
  socket.on("action", (msg) => {
    ignoreNextEvent = true;
    switch (msg.action) {
      case "PLAY":
        mediaplayer.play();
        console.log("[REMOTE] Play");
        break;
      case "PAUSE":
        mediaplayer.pause();
        console.log("[REMOTE] Pause");
        break;

      default:
        break;
    }
  });

  //send PLAY action
  mediaplayer.onplay = () => {
    if (ignoreNextEvent == true) {
      ignoreNextEvent = false;
      return;
    }
    console.log("[LOCAL] Play");
    socket.emit("action", { action: "PLAY" });
  };

  //send PAUSE action
  mediaplayer.onpause = () => {
    if (ignoreNextEvent == true) {
      ignoreNextEvent = false;
      return;
    }
    console.log("[LOCAL] Pause");
    socket.emit("action", { action: "PAUSE" });
  };
}

async function watchparty() {
  const mediaplayer = await loadMediaPlayer();

  const socket = await initSocket(url, token);

  registerEvents(socket, mediaplayer);

  await createRoom(socket);
  console.warn(currentRoom);
}

watchparty();
