export enum Features {
  Play,
  Pause,
  SetTime,
}

export abstract class MediaPlayer {
  readonly supportedFeatures: Features[];
  play: () => void;
  pause: () => void;
  setTime: (time: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onSetTime: (time: number) => void;

  constructor(features: Features[]) {
    this.supportedFeatures = features;
    this.play = () => {
      console.warn("[Watchparty] 'Play' not yet configured on this player");
    };
    this.pause = () => {
      console.warn("[Watchparty] 'Pause' not yet configured on this player");
    };
    this.setTime = () => {
      console.warn("[Watchparty] 'SetTime' not yet configured on this player");
    };
    this.onPlay = () => {
      console.warn("[Watchparty] 'onPlay' not yet configured on this player");
    };
    this.onPause = () => {
      console.warn("[Watchparty] 'onPause' not yet configured on this player");
    };
    this.onSetTime = () => {
      console.warn(
        "[Watchparty] 'onSetTime' not yet configured on this player",
      );
    };

    this.setup();
  }

  /**
   * Sets up the player by initializing necessary variables and event listeners.
   * This function will be called on object creation.
   *
   * @protected
   * @abstract
   * @returns {void}
   */
  protected abstract setup(): void;
}
