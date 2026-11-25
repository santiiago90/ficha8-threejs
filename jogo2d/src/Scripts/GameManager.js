import { Input } from './Input.js';
import { SceneManager } from './SceneManager.js';
import { Time } from './Time.js';

export class GameManager {
  isPaused = false;
  pauseMenu = null;
  #pausePressed = false;
  #music = new Audio('assets/Sounds/backgroundmusic.mp3');
  #musicUnlocked = false;

  start() {
    this.#music.loop = true;
    this.pauseMenu?.querySelector('#btnResume').addEventListener('click', () => this.resumeGame());
    this.pauseMenu?.querySelector('#btnMenu').addEventListener('click', () => SceneManager.loadScene('index'));

    const unlockMusic = () => {
      this.#musicUnlocked = true;
      if (!this.isPaused) this.#playMusic();
    };
    window.addEventListener('pointerdown', unlockMusic);
    window.addEventListener('keydown', unlockMusic);
  }

  update() {
    const pause = Input.getButton('Pause');
    if (pause && !this.#pausePressed) {
      if (this.isPaused) this.resumeGame();
      else this.pauseGame();
    }
    this.#pausePressed = pause;
  }

  pauseGame() {
    this.isPaused = true;
    Time.timeScale = 0;
    if (this.pauseMenu) this.pauseMenu.hidden = false;
    this.#music.pause();
  }

  resumeGame() {
    this.isPaused = false;
    Time.timeScale = 1;
    if (this.pauseMenu) this.pauseMenu.hidden = true;
    if (this.#musicUnlocked) this.#playMusic();
  }

  #playMusic() {
    if (this.#music.paused) {
      this.#music.play().catch(() => {
        // O navegador pode exigir outra interação antes de permitir o som.
      });
    }
  }
}
