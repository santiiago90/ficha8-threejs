import { destroyObject } from './Fisica.js';
import { Player } from './Player.js';
import { ScoreManager } from './ScoreManager.js';

export class CoinPickup {
  pointToAdd = 10;
  #coinPickupEffect;
  #collected = false;

  constructor(object) {
    this.object = object;
    this.object.userData.script = this;
    this.#coinPickupEffect = new Audio('assets/Sounds/TreasurePickup.mp3');
  }

  onTriggerEnter(other) {
    if (this.#collected || !(other.userData.script instanceof Player)) return;
    this.#collected = true;
    ScoreManager.addPoints(this.pointToAdd);
    // A recolha continua mesmo se o browser bloquear o som.
    this.#coinPickupEffect.play().catch(() => {});
    destroyObject(this.object);
  }
}
