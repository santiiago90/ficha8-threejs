export class Animator {
  currentState = '';
  parameters;
  #controller;
  #time = 0;

  constructor(object, controller) {
    this.object = object;
    object.userData.animator = this;
    this.#controller = controller;
    this.parameters = { ...controller.parameters };
    this.#changeState(Object.keys(controller.states)[0]);
  }

  get finished() {
    const { images, imagesPerSecond, loop } = this.#controller.states[this.currentState];
    return !loop && this.#time >= images.length / imagesPerSecond;
  }

  setFloat(name, value) {
    this.parameters[name] = value;
  }

  update(dt) {
    if (dt <= 0) return;

    for (const transition of this.#controller.transitions ?? []) {
      if (transition.from === this.currentState && this.#check(transition)) {
        this.#changeState(transition.to);
        return;
      }
    }

    const { images, imagesPerSecond, loop } = this.#controller.states[this.currentState];
    const duration = images.length / imagesPerSecond;
    this.#time = loop ? (this.#time + dt) % duration : Math.min(this.#time + dt, duration);
    const frame = Math.min(Math.floor(this.#time * imagesPerSecond), images.length - 1);
    this.object.material.map = images[frame];
  }

  #check(transition) {
    const value = this.parameters[transition.parameter];
    if (transition.condition === 'greater') return value > transition.value;
    if (transition.condition === 'less') return value < transition.value;
    if (transition.condition === 'lessOrEqual') return value <= transition.value;
    if (transition.condition === 'equals') return value === transition.value;
    return false;
  }

  #changeState(name) {
    this.currentState = name;
    this.#time = 0;
    this.object.material.map = this.#controller.states[name].images[0];
  }
}
