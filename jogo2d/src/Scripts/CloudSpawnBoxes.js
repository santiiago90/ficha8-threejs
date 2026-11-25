import { DebugFisica } from './DebugFisica.js';
import { raycast } from './Fisica.js';

const DOWN = { x: 0, y: -1 };
const RAY_LENGTH = 10;

export class CloudSpawnBoxes {
  boxPrefab = null;
  #hasTargetedPlayer = false;

  constructor(object, fisica) {
    this.object = object;
    object.userData.spawnBoxes = this;
    this.fisica = fisica;
  }

  fixedUpdate() {
    DebugFisica.drawRay(this.object.position, DOWN, RAY_LENGTH);
    if (this.#hasTargetedPlayer || !this.boxPrefab) return;

    const hit = raycast(this.fisica, this.object.position, DOWN, RAY_LENGTH);
    if (hit?.userData.tag !== 'player') return;

    this.#hasTargetedPlayer = true;
    this.#spawnBox().catch((error) => {
      this.#hasTargetedPlayer = false;
      console.error('Não foi possível largar a caixa.', error);
    });
  }

  async #spawnBox() {
    const { x, y } = this.object.position;
    const box = await this.boxPrefab(this.fisica, x, y);
    this.object.parent.add(box);
  }
}
