export class ScoreManager {
  static #score = 0;
  static #scoreText;

  constructor(element) {
    this.element = element;
  }

  start() {
    ScoreManager.#scoreText = this.element;
    ScoreManager.#score = Number(localStorage.getItem('score'));
    if (!Number.isFinite(ScoreManager.#score) || ScoreManager.#score < 0) {
      ScoreManager.#score = 0;
    }
    ScoreManager.#scoreText.textContent = '' + ScoreManager.#score;
  }

  static addPoints(points) {
    ScoreManager.#score += points;
    ScoreManager.#save();
  }

  static getPoints() {
    return ScoreManager.#score;
  }

  static reset() {
    ScoreManager.#score = 0;
    ScoreManager.#save();
  }

  static #save() {
    localStorage.setItem('score', ScoreManager.#score);
    ScoreManager.#scoreText.textContent = '' + ScoreManager.#score;
  }
}
