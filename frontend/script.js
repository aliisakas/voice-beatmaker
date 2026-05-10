// Создаем аудио-контекст
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

const sounds = [
    '../assets/kick.wav',
    '../assets/snare.wav',
    '../assets/hi-hat.wav',
    '../assets/clap.wav'
];

const instrumentNames = ['KICK', 'SNARE', 'HI-HAT', 'CLAP'];
const labelWidth = 80; // Ширина зоны для текста слева

let audioBuffers = [];

const canvas = document.getElementById('sequencerCanvas');
const ctx = canvas.getContext('2d');
const resetBtn = document.getElementById('resetBtn');

const rows = 4;   // Kick, Snare, Hat, OpenHat
const cols = 16;   // Такты
const padding = 8;   // Отступ между клетками

// Матрица состояний клеток
let gridState = Array(rows).fill().map(() => Array(cols).fill(false));

let currentStep = 0;   // Индекс текущего играющего столбца 0-15
let bpm = 120;
let isPlaying = true;

function resizeCanvas() {
    // Делаем ширину холста 90% от ширины окна браузера
    canvas.width = window.innerWidth * 0.9;
    canvas.height = canvas.width / 3.8;
    drawGrid();
}

function drawGrid() {
    // Вычисляем ширину и высоту клетки
    const cellWidth = (canvas.width - labelWidth - (cols + 1) * padding) / cols;
    const cellHeight = (canvas.height - (rows + 1) * padding) / rows;

    // Очищаем весь холст перед отрисовкой
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Идем по каждой строке и столбцу
    for (let r = 0; r < rows; r++) {
        // Рисуем подпись строки
        ctx.fillStyle = '#888';
        ctx.font = '14px Courier New';
        ctx.textAlign = 'right';

        // Центрируем текст по вертикали относительно клетки
        ctx.fillText(instrumentNames[r], labelWidth - 10, 
            r * (cellHeight + padding) + padding + cellHeight / 2 + 5);
        
        for (let c = 0; c < cols; c++) {

            // Вычисляем координаты (x, y) для левого верхнего угла каждой клетки
            const x = c * (cellWidth + padding) + padding + labelWidth;
            const y = r * (cellHeight + padding) + padding;

            if (gridState[r][c]) {
                if (c % 4 == 3) {
                    ctx.fillStyle = '#00e5ff';
                } else {
                    ctx.fillStyle = '#00ff88';
                }
            } else {
                if (c % 4 == 3) {
                    ctx.fillStyle = '#2a2a2a';
                } else {
                    ctx.fillStyle = '#1e1e1e';
                }
            }

            ctx.fillRect(x, y, cellWidth, cellHeight);

            // Если текущий столбец совпадает с тем, который сейчас играет
            if (c === currentStep) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.fillRect(x, y, cellWidth, cellHeight);
            }

            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, cellWidth, cellHeight);
        }
    }
}

function nextStep() {
    if (!isPlaying) return;

    // Проходим циклом по всем 4 строкам текущего столбца
    for (let r = 0; r < rows; r++) {
        if (gridState[r][currentStep] === true) {
            playSample(r);
        }
    }

    currentStep = (currentStep + 1) % cols;

    // Каждый раз, когда шаг меняется, перерисовываем сетку
    drawGrid();

    // Планируем следующий шаг
    setTimeout(nextStep, (60000 / bpm) / 4);
}

async function loadSounds() {
    for (const url of sounds) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        audioBuffers.push(audioBuffer);
    }
    console.log('Все звуки загружены!');
}

function playSample(index) {
    if (!audioBuffers[index]) return;

    // Создаем источник
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffers[index];

    // Соединяем с колонками
    source.connect(audioCtx.destination);

    // Играем прямо сейчас
    source.start(0);
}

canvas.addEventListener('click', (event) => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    // Координаты клика
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Размеры клетки
    const cellWidth = (canvas.width  - labelWidth - padding * (cols + 1)) / cols;
    const cellHeight = (canvas.height - padding * (rows + 1)) / rows;

    // Вычисляем в какую строку, столбец кликнули
    const c = Math.floor((mouseX - padding - labelWidth) / (cellWidth + padding));
    const r = Math.floor((mouseY - padding) / (cellHeight + padding));

    // Изменяем состояние клетки при клике
    if (c >= 0 && c < cols && r >= 0 && r < rows) {
        gridState[r][c] = !gridState[r][c];
        drawGrid();
    }
})

resetBtn.addEventListener('click', () => {
    // Проходим по каждой строке и заполняем её значениями false
    gridState.forEach(row => row.fill(false));
    drawGrid();
});

// Слушаем событие изменения размера окна
window.addEventListener('resize', resizeCanvas);

// Первый запуск функции при загрузке страницы
resizeCanvas();

// Запускаем цикл
nextStep();

loadSounds();