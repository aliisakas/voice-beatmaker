theme: /

    state: Welcome
        q!: $regex</start>
        q!: *(запусти*|открой*|включи*|вруби*) * битмейкер*
        event!: RUN_APP
        a: Привет! Я твой голосовой битмейкер. Давай создадим трек. Какую команду выполнить?

    state: AddInstrument
        q!: * (добавь|поставь|включи|сделай) * (бочк*|кик*|kick|рабоч*|снеер*|снейр*|снэр*|snare|хэт*|хайхэт*|тарелк*|hihat|hi-hat|хлопок|хлопк*|клэп*|clap) * [на] * такт*
        script:
            var text = $request.query.toLowerCase();
            var instIdx = 0;
            if (text.indexOf("рабоч") > -1 || text.indexOf("снеер") > -1 || text.indexOf("снейр") > -1 || text.indexOf("снэр") > -1 || text.indexOf("snare") > -1) instIdx = 1;
            else if (text.indexOf("хэт") > -1 || text.indexOf("хайхэт") > -1 || text.indexOf("тарел") > -1 || text.indexOf("hihat") > -1 || text.indexOf("hi-hat") > -1) instIdx = 2;
            else if (text.indexOf("хлоп") > -1 || text.indexOf("клэп") > -1 || text.indexOf("clap") > -1) instIdx = 3;

            var stepIdx = 0;
            var match = text.match(/\d+/);
            if (match) {
                stepIdx = parseInt(match[0]) - 1;
            }

            if (stepIdx >= 0 && stepIdx <= 15) {
                $response.replies = $response.replies || [];
                $response.replies.push({
                    type: "raw",
                    body: {
                        items: [{
                            command: {
                                type: "smart_app_data",
                                action: {
                                    type: "ADD_INSTRUMENT",
                                    instrument_index: instIdx,
                                    step_index: stepIdx
                                }
                            }
                        }]
                    }
                });
                $reactions.answer("Добавлено!");
            } else {
                $reactions.answer("Скажи номер такта от одного до шестнадцати.");
            }

    state: Reset
        q!: * (очисти*|сбрось*|удали*|сброс) *
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
                type: "raw",
                body: {
                    items: [{
                        command: {
                            type: "smart_app_data",
                            action: {
                                type: "RESET"
                            }
                        }
                    }]
                }
            });
            $reactions.answer("Всё очищено!");

    state: CatchAll
        event!: noMatch
        a: Извини, я не понял команду. Попробуй сказать "добавь бочку на 5 такт" или "очисти всё".