const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

const sounds = [
    '../assets/kick.wav',
    '../assets/snare.wav',
    '../assets/hi-hat.wav',
    '../assets/clap.wav'
];

const instrumentNames = ['KICK', 'SNARE', 'HI-HAT', 'CLAP'];
let audioBuffers = [];

const gridContainer = document.getElementById('sequencer-grid');
const resetBtn = document.getElementById('resetBtn');

const rows = 4;   // Kick, Snare, Hat, OpenHat
const cols = 16;   // Такты
let gridState = Array(rows).fill().map(() => Array(cols).fill(false));
let domGrid = []; // Хранит ссылки на HTML-кнопки

let currentStep = 0;   // Индекс текущего играющего столбца 0-15
let bpm = 120;
let isPlaying = true;

// Создаем DOM сетку
function initGrid() {
    gridContainer.innerHTML = '';
    domGrid = [];

    for (let r = 0; r < rows; r++) {
        // Подпись инструмента
        const label = document.createElement('div');
        label.className = 'instrument-label';
        label.innerText = instrumentNames[r];
        gridContainer.appendChild(label);

        const rowElements = [];
        for (let c = 0; c < cols; c++) {
            const btn = document.createElement('button');
            btn.className = 'cell';
            btn.tabIndex = 0; // Обязательно для пульта ТВ
            
            // Визуально выделяем каждую 4-ю долю
            if (c % 4 === 3) btn.classList.add('beat-start');

            // Обработчик клика мышкой или пультом
            btn.addEventListener('click', () => {
                if (audioCtx.state === 'suspended') audioCtx.resume();
                toggleCell(r, c);
            });

            gridContainer.appendChild(btn);
            rowElements.push(btn);
        }
        domGrid.push(rowElements);
    }
}

// Логика переключения клетки
function toggleCell(r, c) {
    gridState[r][c] = !gridState[r][c];
    updateGridVisuals();
}

// Обновление внешнего вида кнопок
function updateGridVisuals() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const btn = domGrid[r][c];
            
            if (gridState[r][c]) {
                btn.classList.add('active');
                if (c % 4 === 3) btn.classList.add('alt'); // Чередование цвета
            } else {
                btn.classList.remove('active', 'alt');
            }

            // Подсветка текущего шага
            if (c === currentStep) {
                btn.classList.add('playing');
            } else {
                btn.classList.remove('playing');
            }
        }
    }
}

// Шаг секвенсора
function nextStep() {
    if (!isPlaying) return;

    for (let r = 0; r < rows; r++) {
        if (gridState[r][currentStep] === true) {
            playSample(r);
        }
    }

    currentStep = (currentStep + 1) % cols;
    updateGridVisuals();
    setTimeout(nextStep, (60000 / bpm) / 4);
}

// Загрузка аудио
async function loadSounds() {
    for (const url of sounds) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        audioBuffers.push(audioBuffer);
    }
    console.log('Все звуки загружены!');

    // Показываем кнопку очистки
    if (resetBtn) {
        resetBtn.style.display = 'inline-block'; 
    }
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

// Математическая функция для "голосового" клика
function addInstrumentViaVoice(row, col) {
    if (row < rows && col < cols) {
        gridState[row][col] = true;
        updateGridVisuals();
    }
}


resetBtn.addEventListener('click', () => {
    // Проходим по каждой строке и заполняем её значениями false
    gridState.forEach(row => row.fill(false));
    updateGridVisuals();
});


// Ассистент Сбера
let assistant = null;

function initAssistant() {
    if (typeof createAssistant !== 'undefined') {
        assistant = createAssistant({ getState: () => ({ item: 'beatmaker_state' }) });
        
        assistant.on('data', (event) => {
            const action = event.action || event.smart_app_data || event;
            
            if (action) {
                switch (action.type) {
                    case 'ADD_INSTRUMENT':
                        addInstrumentViaVoice(action.instrument_index, action.step_index);
                        break;
                    case 'RESET':
                        if (resetBtn) resetBtn.click();
                        break;
                }
            }
        });
        console.log("Голосовой ассистент успешно подключен!");
    }
}


// Инициализация
initGrid();
nextStep();
loadSounds();