import { waitForElement } from "../util/waitForElement";
import { waitForElementDeletion } from "../util/waitForElementDeletion";
import { Features, MediaPlayer } from "./mediaplayer";

export class NetflixPlayer extends MediaPlayer {
  video: HTMLVideoElement;
  private lastVolumeChange = 0;

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

    /*
     * handle pause events and filter out false ones
     */
    this.video.addEventListener("pause", (event) => {
      if (event.timeStamp - this.lastVolumeChange < 500) {
        console.log("Next episode detected - not relaying pause event");
        return;
      }
      this.onPause();
    });

    /*
     * handle seek events which occur when the video gets set to a new time
     */
    this.video.addEventListener("seeked", (event) => {
      this.onSetTime((event.target as HTMLVideoElement).currentTime);
    });

    /** stores the last time the volume was changed
     *  this is used to determine if a pause event got fired
     *  by moving to a next episode in firefox
     */
    this.video.addEventListener("volumechange", (event) => {
      this.lastVolumeChange = event.timeStamp;
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
