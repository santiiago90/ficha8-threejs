import * as THREE from 'three';

const loader = new THREE.TextureLoader();

export async function createAnimation(prefix, numImages, imagesPerSecond = 12) {
  const images = [];
  for (let i = 1; i <= numImages; i++) {
    const texture = await loader.loadAsync(`${prefix} (${i}).png`);
    texture.colorSpace = THREE.SRGBColorSpace;
    images.push(texture);
  }
  return { images, imagesPerSecond, loop: true };
}
