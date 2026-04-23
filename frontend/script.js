const canvas = document.getElementById('sequencerCanvas');
const ctx = canvas.getContext('2d');

const rows = 4;   // Kick, Snare, Hat, OpenHat
const cols = 16;   // Такты
const padding = 8;   // Отступ между клетками

function resizeCanvas() {
    // Делаем ширину холста 90% от ширины окна браузера
    canvas.width = window.innerWidth * 0.9;
    canvas.height = canvas.width / 3.8;
    drawGrid();
}

function drawGrid() {
    // Вычисляем ширину и высоту клетки
    const cellWidth = (canvas.width - (cols + 1) * padding) / cols;
    const cellHeight = (canvas.height - (rows + 1) * padding) / rows;

    // Очищаем весь холст перед отрисовкой
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Идем по каждой строке и столбцу
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {

            // Вычисляем координаты (x, y) для левого верхнего угла каждой клетки
            const x = c * (cellWidth + padding) + padding;
            const y = r * (cellHeight + padding) + padding;

            // Если колонка делится на 4 без остатка — красим чуть светлее
            if ((c + 1) % 4 === 0) {
                ctx.fillStyle = '#2a2a2a';
            } else {
                ctx.fillStyle = '#1e1e1e';
            }

            ctx.fillRect(x, y, cellWidth, cellHeight);

            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, cellWidth, cellHeight);
        }
    }
}

// Слушаем событие изменения размера окна
window.addEventListener('resize', resizeCanvas);

// Первый запуск функции при загрузке страницы
resizeCanvas();