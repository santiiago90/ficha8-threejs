
import * as THREE from 'three';

export class MainCamera {
  #player;
  #offset;

  constructor(object, scene) {
    this.object = object;
    this.scene = scene;
  }

  start() {
    this.#player = this.scene.getObjectByName('Player');
    this.#offset = new THREE.Vector3(0, 1, 10);
  }

  lateUpdate() {
    // A câmara acompanha a posição do jogador
    this.object.position.set(
      this.#player.position.x + this.#offset.x,
      this.#player.position.y + this.#offset.y,
      this.#offset.z
    );
  }
}
