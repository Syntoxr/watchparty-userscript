import { Sites, getCurrentSite } from "../util/sites";
import { MediaPlayer } from "./mediaplayer";
import { NetflixPlayer } from "./netflixPlayer";

//find, wrap and return mediaplayer for current website
export function getMediaPlayer(): MediaPlayer {
  const site = getCurrentSite();
  if (site === Sites.netflix) {
    return new NetflixPlayer();
  } else {
    throw new Error(
      "Could not match any mediaplayer wrapper for current Website",
    );
  }
}
