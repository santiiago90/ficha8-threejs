import { ScoreManager } from '../Scripts/ScoreManager.js';
import { createCoin } from '../Prefabs/coin.js';
import './hud.css';
import * as THREE from 'three';
import { criarSprite } from '../Materials/sprite.js';
import { criarPlataforma } from '../Prefabs/plataforma.js';
import { criarBackground } from '../Prefabs/background.js';
import RAPIER from '@dimforge/rapier2d-compat';
import { adicionarRigidbody, sincronizarFisica, adicionarBoxCollider, adicionarCircleCollider, handleCollisions } from '../Scripts/Fisica.js';
import { DebugFisica } from '../Scripts/DebugFisica.js';
import GUI from 'lil-gui';
import { Player } from '../Scripts/Player.js';
import { Animator } from '../Scripts/Animator.js';
import { playerController } from '../Animation/playerController.js';
import { MainCamera } from '../Scripts/MainCamera.js';
import { createLimit } from '../Prefabs/limit.js';
import { createCloud1 } from '../Prefabs/cloud1.js';
import { createCloud2 } from '../Prefabs/cloud2.js';
import { createGoodCloud } from '../Prefabs/goodCloud.js';
import { createEnemy } from '../Prefabs/enemy.js';
import { createCheckpoint } from '../Prefabs/checkpoint.js';
import { GameManager } from '../Scripts/GameManager.js';
import { Level1Manager } from '../Scripts/Level1Manager.js';
import { Time } from '../Scripts/Time.js';

// ---------- Renderer: desenha a cena num <canvas> ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// ---------- Main Camera (ortográfica = 2D) ----------
const TAMANHO_CAMERA = 5; // metade da altura visível, em unidades
const camera = new THREE.OrthographicCamera();
camera.position.z = 10;

function ajustarEcra() {
  const aspeto = window.innerWidth / window.innerHeight;
  camera.left = -TAMANHO_CAMERA * aspeto;
  camera.right = TAMANHO_CAMERA * aspeto;
  camera.top = TAMANHO_CAMERA;
  camera.bottom = -TAMANHO_CAMERA;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
ajustarEcra();
window.addEventListener('resize', ajustarEcra);

// ---------- Cena ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x314d79);

await RAPIER.init();
const fisica = new RAPIER.World({ x: 0, y: -9.81 });

const mundo = new THREE.Group();
mundo.name = 'World';
scene.add(mundo);

const bgFundos = await criarBackground(0, 0);
bgFundos.name = 'Background';
mundo.add(bgFundos);

const coin1 = await createCoin(fisica, 1.2, -2.2);
const coin2 = await createCoin(fisica, -5.5, 2.2);
const coin3 = await createCoin(fisica, 5.5, 2.2);
const coin4 = await createCoin(fisica, 11, 0.4);
const coin5 = await createCoin(fisica, 16, -1.1);
mundo.add(coin1, coin2, coin3, coin4, coin5);

const chao = new THREE.Group();
chao.name = 'Ground';
mundo.add(chao);

const plat1 = await criarPlataforma('Plat1', 0, -3.5);

const plat2 = await criarPlataforma('Plat2', -6, 0.4);

const plat3 = await criarPlataforma('Plat3', 6 , 0.4);

const plat4 = await criarPlataforma('Plat4', 0, 3.2);

const plat5 = await criarPlataforma('Plat5', 11, -0.9);
const plat6 = await criarPlataforma('Plat6', 16, -2.4);

chao.add(plat1, plat2, plat3, plat4, plat5, plat6);

for (const plataforma of chao.children) {
  adicionarBoxCollider(fisica, plataforma);
}

const checkpoint1 = createCheckpoint('Checkpoint1', -1.6, 0.9);
const checkpoint2 = createCheckpoint('Checkpoint2', 1.6, 0.9);
plat3.add(checkpoint1, checkpoint2);

const enemy1 = await createEnemy(fisica, plat3.position.x - 0.5, plat3.position.y + 0.9);
const enemy1Script = enemy1.userData.script;
enemy1Script.checkpoint1 = checkpoint1;
enemy1Script.checkpoint2 = checkpoint2;
mundo.add(enemy1);

// Patrulha vertical na passagem entre a Plat3 e a Plat5.
const xPatrulhaVertical = 8.5;
const checkpointInferior = createCheckpoint('CheckpointInferior', xPatrulhaVertical, -0.6);
const checkpointSuperior = createCheckpoint('CheckpointSuperior', xPatrulhaVertical, 2.4);
const enemy2 = await createEnemy(fisica, xPatrulhaVertical, 1.2, 'y');
const enemy2Script = enemy2.userData.script;
enemy2Script.checkpoint1 = checkpointInferior;
enemy2Script.checkpoint2 = checkpointSuperior;
enemy2Script.speed = 1.8;
mundo.add(checkpointInferior, checkpointSuperior, enemy2);

// Limite invisível abaixo das plataformas, de uma ponta à outra do mapa.
const limitesMapa = new THREE.Box3().setFromObject(bgFundos);
limitesMapa.union(new THREE.Box3().setFromObject(chao));
const limite = createLimit(
  fisica,
  (limitesMapa.min.x + limitesMapa.max.x) / 2,
  -6,
  limitesMapa.max.x - limitesMapa.min.x + 20,
);
mundo.add(limite);

const checkpoint = await criarSprite('assets/Sprites/Objects/Sign.png');
checkpoint.name = 'Checkpoint';
checkpoint.userData.tag = 'checkpoint';
checkpoint.position.set(plat5.position.x, plat5.position.y + 1.08, 1.1);
mundo.add(checkpoint);
adicionarCircleCollider(fisica, checkpoint, true);

const level1Manager = new THREE.Group();
level1Manager.name = 'Level1Manager';
level1Manager.position.set(-6, 3.5, 0);
scene.add(level1Manager);

// Paisagem simples com os sprites disponibilizados, sem novas colisões.
for (const [nome, imagem, plataforma, deslocamento] of [
  ['Arvore', 'Tree.png', plat1, -1.2],
  ['Arbusto', 'Bush (1).png', plat2, -0.8],
  ['Cato', 'Cactus (2).png', plat3, 1],
  ['Relva', 'Grass (1).png', plat4, -0.9],
]) {
  const decoracao = await criarSprite(`assets/Sprites/Objects/${imagem}`);
  decoracao.name = nome;
  const caixaPlataforma = new THREE.Box3().setFromObject(plataforma);
  const altura = decoracao.geometry.parameters.height;
  decoracao.position.set(
    plataforma.position.x + deslocamento,
    caixaPlataforma.max.y + altura / 2,
    0.5,
  );
  mundo.add(decoracao);
}

const player = await criarSprite('assets/Sprites/Player/Idle (1).png');
player.name = 'Player';
player.userData.tag = 'player';
// O desenho ocupa o lado esquerdo da textura. Centrar a viragem no collider.
player.geometry.translate(player.geometry.parameters.width * 0.22, 0, 0);
player.scale.set(0.5, 0.5, 1);
player.position.set(0, 0, 2);
scene.add(player);

adicionarRigidbody(fisica, player);
adicionarBoxCollider(fisica, player, 0.54, 0.83, 0, 0.02);

function mostrarHierarquia(objeto, nivel = 0) {
  console.log('  '.repeat(nivel) + (objeto.name || objeto.type));
  for (const filho of objeto.children) {
    mostrarHierarquia(filho, nivel + 1);
  }
}
mostrarHierarquia(scene);

// ---------- Ciclo de jogo ----------
const playerScript = new Player(player);
const playerAnimator = new Animator(player, playerController);
playerScript.lifeImages = [...document.querySelectorAll('#lives img')];

const gameManager = new GameManager();
gameManager.pauseMenu = document.querySelector('#pauseMenu');
const debugFisica = new DebugFisica(scene, fisica);

const scripts = [
  gameManager,
  debugFisica,
  playerScript,
  playerAnimator,
  enemy1Script,
  enemy2Script,
  new ScoreManager(document.querySelector('#scoreValue')),
  new MainCamera(camera, scene),
];

const level1Script = new Level1Manager(level1Manager, scene, scripts);
level1Script.cloudPrefab1 = createCloud1;
level1Script.cloudPrefab2 = createCloud2;
level1Script.goodCloudPrefab = (x, y) => createGoodCloud(fisica, x, y + 0.75);
scripts.push(level1Script);

const gui = new GUI({ title: 'Inspector' });
gui.add(playerScript, 'movementSpeed', 0, 10, 0.1);
gui.add(playerScript, 'jumpPower', 0, 100, 1);
gui.add(playerAnimator, 'currentState').listen().disable();
gui.add(playerAnimator.parameters, 'speed', 0, 1, 0.01).listen();
gui.add(debugFisica.linhas, 'visible').name('Mostrar física');
gui.add({ checkpoints: false }, 'checkpoints').name('Mostrar patrulhas').onChange((visible) => {
  for (const marker of [checkpoint1, checkpoint2, checkpointInferior, checkpointSuperior]) {
    marker.visible = visible;
  }
});

gui.add(gameManager, 'isPaused').listen().onChange((pausado) => {
  if (pausado) gameManager.pauseGame();
  else gameManager.resumeGame();
});

const PASSO_FIXO = 1 / 50; // 50 vezes por segundo
fisica.timestep = PASSO_FIXO;
let acumulador = 0;
for (const script of scripts) await script.start?.();

let tempoAnterior = performance.now();

const eventos = new RAPIER.EventQueue(true);

renderer.setAnimationLoop((agora) => {
  const estavaPausado = gameManager.isPaused;
  gameManager.update();

  // O frame que retoma o jogo ainda pertence ao intervalo de pausa.
  const dt = estavaPausado ? 0 : Math.min((agora - tempoAnterior) / 1000, 0.1) * Time.timeScale;
  tempoAnterior = agora;

  // 1x por frame
  for (const script of scripts) {
    if (script !== gameManager) script.update?.(dt);
  }

  // em intervalos fixos
  acumulador += dt;
  while (acumulador >= PASSO_FIXO) {
    for (const script of scripts) script.fixedUpdate?.(PASSO_FIXO);
    fisica.step(eventos);
    handleCollisions(fisica, eventos);
    acumulador -= PASSO_FIXO;
  }

  sincronizarFisica(scene);
  // Atualizar a câmara depois da física
  for (const script of scripts) script.lateUpdate?.();
  renderer.render(scene, camera);
});
