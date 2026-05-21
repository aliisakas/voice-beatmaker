/**
 * Модуль для работы с Web Audio API.
 * Загружает wav-сэмплы и умеет их воспроизводить.
 */

const AudioContextClass = window.AudioContext || window.webkitAudioContext;

// Один глобальный AudioContext на всё приложение
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

// Пути к сэмплам (из папки public/assets)
const SAMPLE_URLS = [
  `${process.env.PUBLIC_URL}/assets/kick.wav`,
  `${process.env.PUBLIC_URL}/assets/snare.wav`,
  `${process.env.PUBLIC_URL}/assets/hi-hat.wav`,
  `${process.env.PUBLIC_URL}/assets/clap.wav`,
];

/**
 * Загружает все сэмплы и возвращает массив AudioBuffer.
 * @returns {Promise<AudioBuffer[]>}
 */
export async function loadSounds() {
  const ctx = getAudioContext();
  const buffers = [];

  for (const url of SAMPLE_URLS) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    buffers.push(audioBuffer);
  }

  return buffers;
}

/**
 * Воспроизводит один сэмпл по индексу (0=kick, 1=snare, 2=hi-hat, 3=clap).
 * @param {AudioBuffer[]} buffers
 * @param {number} index
 */
export function playSample(buffers, index) {
  if (!buffers[index]) return;

  const ctx = getAudioContext();

  // Разблокируем контекст, если браузер его приостановил (политика автозапуска)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const source = ctx.createBufferSource();
  source.buffer = buffers[index];
  source.connect(ctx.destination);
  source.start(0);
}

/**
 * Разблокирует AudioContext после первого пользовательского жеста.
 */
export function resumeAudioContext() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
}
