import * as THREE from 'three';
import { criarSprite } from '../Materials/sprite.js';
import { adicionarCircleCollider } from '../Scripts/Fisica.js';
import { CoinPickup } from '../Scripts/CoinPickup.js';

export async function createCoin(physics, x, y) {
  const coin = new THREE.Group();
  coin.name = 'Coin';
  coin.position.set(x, y, 0);
  const image = await criarSprite('assets/Sprites/Objects/coin.png');
  image.name = 'CoinImage';
  // Normaliza a imagem descarregada para uma moeda com 0,6 unidades de largura.
  image.scale.setScalar(0.6 / image.geometry.parameters.width);
  image.position.set(0, 0, 1.5);
  coin.add(image);
  const collider = adicionarCircleCollider(physics, coin, true);
  collider.setRadius(collider.radius() * 0.9);
  new CoinPickup(coin);
  return coin;
}
