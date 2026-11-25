import { Vector3 } from 'three';

export class Enemy {
  checkpoint1 = null;
  checkpoint2 = null;
  speed = 1;
  isMovingLeft = true;
  axis = 'x';
  #checkpointPosition = new Vector3();

  constructor(object) {
    this.object = object;
    object.userData.script = this;
  }

  start() {
    if (this.#position(this.checkpoint1) > this.#position(this.checkpoint2)) {
      [this.checkpoint1, this.checkpoint2] = [this.checkpoint2, this.checkpoint1];
    }
  }

  #position(checkpoint) {
    return checkpoint.getWorldPosition(this.#checkpointPosition)[this.axis];
  }

  fixedUpdate(dt) {
    if (!this.object.parent) return;

    const position = this.object.position;
    const boundary = this.#position(this.isMovingLeft ? this.checkpoint1 : this.checkpoint2);
    const next = position[this.axis] + (this.isMovingLeft ? -1 : 1) * this.speed * dt;
    const reachedBoundary = this.isMovingLeft ? next <= boundary : next >= boundary;
    position[this.axis] = reachedBoundary ? boundary : next;
    if (reachedBoundary) this.isMovingLeft = !this.isMovingLeft;

    if (this.axis === 'x') this.object.scale.x = this.isMovingLeft ? 1 : -1;
    this.object.userData.rigidBody.setNextKinematicTranslation({ x: position.x, y: position.y });
  }
}
