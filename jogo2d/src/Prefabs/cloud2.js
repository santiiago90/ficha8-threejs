import { criarSprite } from '../Materials/sprite.js';
import { Clouds } from '../Scripts/Clouds.js';

export async function createCloud2(x, y) {
  const cloud = await criarSprite('assets/Sprites/Objects/Cloud_2.png');
  cloud.name = 'Cloud2';
  cloud.position.set(x, y, 0.5);
  new Clouds(cloud);
  return cloud;
}
