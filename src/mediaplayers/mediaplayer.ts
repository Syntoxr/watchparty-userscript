import { getNetflixPlayer } from "./netflixPlayer";

export enum Features {
  Play,
  Pause,
  SetTime,
}

export class MediaPlayer {
  play: () => void;
  pause: () => void;
  setTime: (time: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onSetTime: (time: number) => void;
  readonly supportedFeatures: Features[];

  constructor(features: Features[]) {
    this.supportedFeatures = features;
    this.play = () => {
      console.warn("[Watchparty] Play not supported by this player");
    };
    this.pause = () => {
      console.warn("[Watchparty] Pause not supported by this player");
    };
    this.setTime = () => {
      console.warn("[Watchparty] SetTime not supported by this player");
    };
  }
}

//find, wrap and return mediaplayer for current website
export async function getMediaPlayer(): Promise<MediaPlayer> {
  const host = window.location.host;
  switch (host) {
    case "www.netflix.com":
      return getNetflixPlayer();

    default:
      return new Promise((resolve, reject) => {
        reject("Could not match any mediaplayer wrapper for current Website");
      });
  }
}