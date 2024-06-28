import { waitForElement } from "../util/waitForElement";
import { waitForElementDeletion } from "../util/waitForElementDeletion";
import { Features, MediaPlayer } from "./mediaplayer";

export class NetflixPlayer extends MediaPlayer {
  video: HTMLVideoElement;
  constructor() {
    super([Features.Play, Features.Pause]);
  }

  protected async setup() {
    this.video = (await waitForElement("video")) as HTMLVideoElement;
    /**
     * Player controls
     */
    this.play = () => this.video.play();
    this.pause = () => this.video.pause();
    this.setTime = () => {};

    /**
     * Player events
     */

    this.video.addEventListener("play", () => {
      this.onPlay();
    });

    this.video.addEventListener("pause", () => {
      this.onPause();
    });

    this.video.addEventListener("seeked", (event) => {
      this.onSetTime((event.target as HTMLVideoElement).currentTime);
    });

    /**
     * recall setup on deletion
     */

    waitForElementDeletion(this.video, this.video.parentElement).then(
      async () => {
        console.log("player deleted");
        this.setup();
      },
    );
    console.log("Player rigged");
  }
}
