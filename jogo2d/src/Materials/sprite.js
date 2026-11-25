import * as THREE from 'three';

export const PIXEIS_POR_UNIDADE = 100;
const loader = new THREE.TextureLoader();

export async function criarSprite(caminho) {
  const textura = await loader.loadAsync(caminho);
  textura.colorSpace = THREE.SRGBColorSpace;
  const geometria = new THREE.PlaneGeometry(
    textura.image.width / PIXEIS_POR_UNIDADE,
    textura.image.height / PIXEIS_POR_UNIDADE,
  );
  const material = new THREE.MeshBasicMaterial({ map: textura, transparent: true });
  return new THREE.Mesh(geometria, material);
}
