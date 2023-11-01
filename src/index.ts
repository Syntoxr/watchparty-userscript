import "./style/main.less";
import "./ui";
import "./socket";
import { Ui } from "./ui";
import { WpSocket } from "./socket";
import { MediaPlayer } from "./mediaplayer";

async function main() {
  console.log("watchparty start");
  let wpSocket: WpSocket;
  let mediaplayer = new MediaPlayer();
  const ui = new Ui();

  ui.onServerDetailsChanged = () => {
    wpSocket.close();

    if (!ui.serverUrl || !ui.serverToken) {
      return;
    }
    wpSocket = new WpSocket(ui.serverUrl, ui.serverToken, mediaplayer, ui);
  };

  ui.onRoomDetailsChanged = () => {
    wpSocket.joinRoom(ui.roomName, ui.roomPassword);
  };
}

main().catch((e) => {
  console.log(e);
});
