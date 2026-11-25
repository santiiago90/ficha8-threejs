import './menu.css';
import { MainMenu } from '../Scripts/MainMenu.js';
import { SceneManager } from '../Scripts/SceneManager.js';
import { ScoreManager } from '../Scripts/ScoreManager.js';

const pontuacao = new ScoreManager(document.querySelector('#scoreValue'));
pontuacao.start();

const menu = new MainMenu();
document.querySelector('#btnRetry').addEventListener('click', () => menu.newGame());
document.querySelector('#btnMainMenu').addEventListener('click', () => SceneManager.loadScene('index'));
