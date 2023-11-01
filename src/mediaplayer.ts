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

export class MediaPlayer {
  play: () => void;
  pause: () => void;
  setTime: (time: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onSetTime: (time: number) => void;

  async initMediaPlayer() {
    const host = window.location.host;
    switch (host) {
      case "www.netflix.com":
        const video = (await waitForElement("video")) as HTMLVideoElement;
        this.play = () => video.play();
        this.pause = () => video.pause();
        this.setTime = () => {};

        video.addEventListener("play", () => {
          this.onPlay();
        });

        video.addEventListener("pause", () => {
          this.onPause();
        });

        video.addEventListener("seeked", (event) => {
          console.log(event);
          this.onSetTime((event.target as HTMLVideoElement).currentTime);
        });

      default:
        throw "Could not match any mediaplayer wrapper for current Website";
    }
  }
}
