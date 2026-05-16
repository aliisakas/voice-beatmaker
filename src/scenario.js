const { 
    createIntents, 
    createStates, 
    createScenarioWalker, 
    createSaluteResponse,
    createUserDb
} = require('@salutejs/scenario');

// Маппинг: Слово - Индекс строки (r)
const instrumentMap = {
    'бочка': 0, 'кик': 0, 'kick': 0,
    'рабочий': 1, 'снеер': 1, 'снейр': 1, 'снэр': 1, 'snare': 1,
    'хэт': 2, 'хайхэт': 2, 'тарелка': 2, 'тарелки': 2, 'hihat': 2, 'hi-hat': 2,
    'хлопок': 3, 'клэп': 3, 'clap': 3
};

const intents = createIntents({
    AddInstrument: {
        matchers: [
            'добавь {instrument} на {step} такт',
            'добавь {instrument} на {step}',
            'поставь {instrument} на {step} такт',
            'поставь {instrument} на {step}',
            'включи {instrument} на {step} такт',
            'включи {instrument} на {step}',
            'сделай {instrument} на {step} такт',
            'сделай {instrument} на {step}'
        ],
    },
    Reset: {
        matchers: ['очисти всё', 'сбрось', 'сбрось всё', 'удали всё', 'сброс']
    }
});

const states = createStates({
    Main: {
        intent: intents.AddInstrument,
        handler: ({ req, res }) => {
            // Извлекаем данные из фразы
            const { instrument, step } = req.entities;
            
            // Превращаем название в индекс (0-3)
            const instIdx = instrumentMap[instrument.toLowerCase()] ?? 0;
            
            // Превращаем номер такта в индекс (0-15)
            const stepIdx = parseInt(step) - 1;

            // Проверка границ
            if (stepIdx < 0 || stepIdx > 15) {
                res.appendBubble('Всего 16 тактов, выбери от 1 до 16.');
            } else {
                res.appendBubble(`Добавлен ${instrument} на ${step} такт.`);
                res.setServerAction({
                    type: 'ADD_INSTRUMENT',
                    instrument_index: instIdx,
                    step_index: stepIdx
                });
            }
        }
    },

    ResetState: {
        intent: intents.Reset,
        handler: ({ res }) => {
            res.appendBubble('Всё чисто для нового бита!');
            res.setServerAction({ type: 'RESET' });
        }
    }
});


const scenario = createScenarioWalker({
    intents,
    states
});

module.exports.scenario = scenario;