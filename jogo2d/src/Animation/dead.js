import { createAnimation } from './animation.js';

export const dead = await createAnimation('assets/Sprites/Player/Dead', 8);
dead.loop = false;
