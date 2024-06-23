import { waitForElement } from "../util/waitForElement";
import { Features, MediaPlayer } from "./mediaplayer";

export async function getNetflixPlayer(): Promise<MediaPlayer> {
  const video = (await waitForElement("video")) as HTMLVideoElement;
  const mediaPlayer = new MediaPlayer([Features.Play, Features.Pause]);
  mediaPlayer.play = () => video.play();
  mediaPlayer.pause = () => video.pause();
  mediaPlayer.setTime = () => {};

  video.addEventListener("play", () => {
    mediaPlayer.onPlay();
  });

  video.addEventListener("pause", () => {
    mediaPlayer.onPause();
  });

  video.addEventListener("seeked", (event) => {
    console.log(event);
    mediaPlayer.onSetTime((event.target as HTMLVideoElement).currentTime);
  });

  return mediaPlayer;
}
