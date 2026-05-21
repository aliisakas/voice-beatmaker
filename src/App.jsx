import React from 'react';
import { initializeAssistant } from './assistant';
import { loadSounds, playSample, resumeAudioContext } from './audio';
import Sequencer from './components/Sequencer';
import './App.css';

const ROWS = 4;
const COLS = 16;

function makeEmptyGrid() {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(false));
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // Состояние сетки секвенсора: 4 инструмента × 16 тактов
      gridState: makeEmptyGrid(),
      // Индекс текущего воспроизводимого шага (0–15)
      currentStep: 0,
      // Звуки загружены?
      soundsLoaded: false,
    };

    // Загруженные AudioBuffer-ы
    this.audioBuffers = [];
    // Таймер секвенсора
    this.sequencerTimer = null;
    // BPM
    this.bpm = 120;

    // Инициализируем ассистента Сбера
    this.assistant = initializeAssistant(() => this.getStateForAssistant());

    this.assistant.on('data', (event) => {
      // Игнорируем служебные события
      if (event.type === 'character' || event.type === 'insets') return;

      const { action } = event;
      if (action && action.type) {
        this.dispatchAssistantAction(action);
      }
    });

    this.assistant.on('start', () => {});
    this.assistant.on('error', (e) => console.error('assistant error', e));
  }

  // ─── Жизненный цикл ─────────────────────────────────────────────────────────

  componentDidMount() {
    loadSounds()
      .then((buffers) => {
        this.audioBuffers = buffers;
        this.setState({ soundsLoaded: true });
        this.startSequencer();
      })
      .catch((err) => console.error('Ошибка загрузки звуков:', err));
  }

  componentWillUnmount() {
    if (this.sequencerTimer) {
      clearTimeout(this.sequencerTimer);
    }
  }

  // ─── Состояние для ассистента ────────────────────────────────────────────────

  getStateForAssistant() {
    return {
      item_selector: {
        items: [],
        ignored_words: ['добавь', 'поставь', 'включи', 'очисти', 'сбрось'],
      },
    };
  }

  // ─── Диспетчер действий ассистента ──────────────────────────────────────────

  dispatchAssistantAction(action) {
    switch (action.type) {
      case 'ADD_INSTRUMENT':
        this.addInstrumentViaVoice(action.instrument_index, action.step_index);
        break;
      case 'RESET':
        this.resetGrid();
        break;
      default:
        console.warn('Неизвестное действие:', action.type);
    }
  }

  // ─── Логика сетки ───────────────────────────────────────────────────────────

  toggleCell = (row, col) => {
    resumeAudioContext();
    this.setState((prevState) => {
      const newGrid = prevState.gridState.map((r) => [...r]);
      newGrid[row][col] = !newGrid[row][col];
      return { gridState: newGrid };
    });
  };

  addInstrumentViaVoice(row, col) {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;
    this.setState((prevState) => {
      const newGrid = prevState.gridState.map((r) => [...r]);
      newGrid[row][col] = true;
      return { gridState: newGrid };
    });
  }

  resetGrid = () => {
    this.setState({ gridState: makeEmptyGrid() });
  };

  // ─── Секвенсор ───────────────────────────────────────────────────────────────

  startSequencer() {
    const step = () => {
      this.setState((prevState) => {
        const { currentStep, gridState } = prevState;

        // Воспроизводим все активные инструменты на текущем шаге
        for (let r = 0; r < ROWS; r++) {
          if (gridState[r][currentStep]) {
            playSample(this.audioBuffers, r);
          }
        }

        const nextStep = (currentStep + 1) % COLS;
        return { currentStep: nextStep };
      });

      // Длительность одного шага в мс (1/16 ноты при заданном BPM)
      const stepMs = (60000 / this.bpm) / 4;
      this.sequencerTimer = setTimeout(step, stepMs);
    };

    const stepMs = (60000 / this.bpm) / 4;
    this.sequencerTimer = setTimeout(step, stepMs);
  }

  // ─── Рендер ─────────────────────────────────────────────────────────────────

  render() {
    const { gridState, currentStep, soundsLoaded } = this.state;

    return (
      <div className="app" onClick={resumeAudioContext}>
        <Sequencer
          gridState={gridState}
          currentStep={currentStep}
          soundsLoaded={soundsLoaded}
          onToggleCell={this.toggleCell}
          onReset={this.resetGrid}
        />
      </div>
    );
  }
}

export default App;
