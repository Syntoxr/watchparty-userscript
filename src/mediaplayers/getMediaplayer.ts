import { MediaPlayer } from "./mediaplayer";
import { NetflixPlayer } from "./netflixPlayer";

//find, wrap and return mediaplayer for current website
export function getMediaPlayer(): MediaPlayer {
  const host = window.location.host;
  switch (host) {
    case "www.netflix.com":
      return new NetflixPlayer();

    default:
      throw new Error(
        "Could not match any mediaplayer wrapper for current Website",
      );
  }
}
