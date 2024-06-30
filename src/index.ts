import { UI } from "./ui";
import { WPSocket } from "./socket";
import { getMediaPlayer } from "./mediaplayers/getMediaplayer";

async function main() {
  console.log("watchparty starting");
  const mediaplayer = getMediaPlayer();
  const wpSocket = new WPSocket(mediaplayer);
  const ui = new UI(wpSocket);
}

main().catch((e) => {
  console.error(e);
});
