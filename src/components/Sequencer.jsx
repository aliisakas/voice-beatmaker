import React from 'react';

const INSTRUMENT_NAMES = ['KICK', 'SNARE', 'HI-HAT', 'CLAP'];
const ROWS = 4;
const COLS = 16;

/**
 * Компонент секвенсора.
 *
 * Props:
 *   gridState    {boolean[][]}  — матрица 4×16, true = клетка активна
 *   currentStep  {number}       — индекс текущего воспроизводимого столбца (0–15)
 *   soundsLoaded {boolean}      — загружены ли сэмплы
 *   onToggleCell {(row, col) => void}
 *   onReset      {() => void}
 */
function Sequencer({ gridState, currentStep, soundsLoaded, onToggleCell, onReset }) {
  return (
    <div className="sequencer">
      <h1 className="sequencer__title">Voice Beatmaker</h1>

      <div className="hints">
        Скажи Салюту:{' '}
        <span>«Добавь бочку на пятый такт»</span> или{' '}
        <span>«Очисти всё»</span>
      </div>

      {!soundsLoaded && (
        <p className="loader">Загрузка звуков…</p>
      )}

      <div className="grid-wrapper">
        <div className="grid">
          {Array.from({ length: ROWS }, (_, row) => (
            <Row
              key={row}
              row={row}
              label={INSTRUMENT_NAMES[row]}
              gridState={gridState}
              currentStep={currentStep}
              onToggleCell={onToggleCell}
            />
          ))}
        </div>
      </div>

      <button
        className="reset-btn"
        onClick={onReset}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.keyCode === 23) {
            e.preventDefault();
            onReset();
          }
        }}
        tabIndex={0}
      >
        Очистить всё
      </button>
    </div>
  );
}

// ── Строка инструмента ────────────────────────────────────────────────────────

function Row({ row, label, gridState, currentStep, onToggleCell }) {
  return (
    <>
      {/* Подпись инструмента */}
      <div className="instrument-label">{label}</div>

      {/* 16 клеток */}
      {Array.from({ length: COLS }, (_, col) => {
        const isActive  = gridState[row][col];
        const isPlaying = col === currentStep;
        // Каждая 4-я клетка (индексы 3, 7, 11, 15) — акцент
        const isBeat    = col % 4 === 3;

        let className = 'cell';
        if (isBeat)    className += ' cell--beat-accent';
        if (isActive)  className += ' cell--active';
        if (isPlaying) className += ' cell--playing';

        return (
          <button
            key={col}
            className={className}
            tabIndex={0}
            aria-label={`${label} такт ${col + 1} ${isActive ? 'включён' : 'выключен'}`}
            aria-pressed={isActive}
            onClick={() => onToggleCell(row, col)}
            onKeyDown={(e) => {
              // Enter на компьютере (13) и OK на пульте ТВ (23)
              if (e.key === 'Enter' || e.keyCode === 23 || e.keyCode === 13) {
                e.preventDefault();
                onToggleCell(row, col);
              }
            }}
          />
        );
      })}
    </>
  );
}

export default Sequencer;
