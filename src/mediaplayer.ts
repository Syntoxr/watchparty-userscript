let netflix: any;

export class MediaPlayer {
  play: () => void;
  pause: () => void;
  setTime: (time: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onSetTime: (time: number) => void;
}

function waitForElement(selector: string): Promise<HTMLVideoElement> {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector) as HTMLVideoElement);
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector) as HTMLVideoElement);
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

async function getNetflix() {
  const video = (await waitForElement("video")) as HTMLVideoElement;
  const mediaPlayer = new MediaPlayer();
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

export async function getMediaPlayer(): Promise<MediaPlayer> {
  const host = window.location.host;
  switch (host) {
    case "www.netflix.com":
      return getNetflix();

    default:
      break;
  }
}
