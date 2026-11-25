import { idle } from './idle.js';
import { run } from './run.js';
import { walk } from './walk.js';
import { jump } from './jump.js';
import { dead } from './dead.js';

export const playerController = {
  states: { idle, run, walk, jump, dead },
  parameters: { speed: 0, verticalSpeed: 0, grounded: true, isDead: 0 },
  transitions: [
    { from: 'idle', to: 'dead', parameter: 'isDead', condition: 'equals', value: 1 },
    { from: 'run', to: 'dead', parameter: 'isDead', condition: 'equals', value: 1 },
    { from: 'walk', to: 'dead', parameter: 'isDead', condition: 'equals', value: 1 },
    { from: 'jump', to: 'dead', parameter: 'isDead', condition: 'equals', value: 1 },
    { from: 'dead', to: 'idle', parameter: 'isDead', condition: 'equals', value: 0 },

    { from: 'idle', to: 'jump', parameter: 'verticalSpeed', condition: 'greater', value: 0.1 },
    { from: 'run', to: 'jump', parameter: 'verticalSpeed', condition: 'greater', value: 0.1 },
    { from: 'walk', to: 'jump', parameter: 'verticalSpeed', condition: 'greater', value: 0.1 },
    { from: 'jump', to: 'idle', parameter: 'grounded', condition: 'equals', value: true },

    { from: 'idle', to: 'run', parameter: 'speed', condition: 'greater', value: 0.5 },
    { from: 'idle', to: 'walk', parameter: 'speed', condition: 'greater', value: 0.01 },
    { from: 'walk', to: 'idle', parameter: 'speed', condition: 'less', value: 0.01 },
    { from: 'walk', to: 'run', parameter: 'speed', condition: 'greater', value: 0.5 },
    { from: 'run', to: 'idle', parameter: 'speed', condition: 'less', value: 0.01 },
    { from: 'run', to: 'walk', parameter: 'speed', condition: 'lessOrEqual', value: 0.5 },
  ],
};
