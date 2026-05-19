theme: /

    state: Welcome
        q!: $regex</start>
        q!: *(запусти*|открой*|включи*|вруби*) * битмейкер*
        event!: RUN_APP
        a: Привет! Я твой голосовой битмейкер. Давай создадим трек. Какую команду выполнить?

    state: AddInstrument
        q!: * (добавь*|поставь*|включи*|сделай*) * (бочк*|кик*|kick|рабоч*|снеер*|снейр*|снэр*|снер*|snare|хэт*|хайхэт*|хай-хэт*|хай хэт*|тарелк*|hihat|hi-hat|hi hat|хлопок|хлопк*|клэп*|клеп*|clap) * [на] * такт*
        script:
            var text = $request.query.toLowerCase();
            
            // ПАРСИНГ ИНСТРУМЕНТА
            var instIdx = 0; // 0 - kick по умолчанию
            if (text.match(/(рабоч|снеер|снейр|снэр|снер|snare)/)) instIdx = 1;
            else if (text.match(/(хэт|хайхэт|хай-хэт|хай хэт|тарел|hihat|hi-hat|hi hat)/)) instIdx = 2;
            else if (text.match(/(хлоп|клэп|клеп|clap)/)) instIdx = 3;

            // ПАРСИНГ НОМЕРА ТАКТА
            var num = -1;
            var match = text.match(/\d+/);
            
            if (match) {
                // Если Салют прислал цифрой
                num = parseInt(match[0]);
            } else {
                // Ищем длинные числа (11-16)
                if (text.indexOf("одиннадцат") > -1) num = 11;
                else if (text.indexOf("двенадцат") > -1) num = 12;
                else if (text.indexOf("тринадцат") > -1) num = 13;
                else if (text.indexOf("четырнадцат") > -1) num = 14;
                else if (text.indexOf("пятнадцат") > -1) num = 15;
                else if (text.indexOf("шестнадцат") > -1) num = 16;
                
                // Затем ищем короткие числа (1-10)
                else if (text.indexOf("перв") > -1 || text.indexOf("один") > -1) num = 1;
                else if (text.indexOf("втор") > -1 || text.indexOf("два") > -1 || text.indexOf("две") > -1) num = 2;
                else if (text.indexOf("трет") > -1 || text.indexOf("три") > -1) num = 3;
                else if (text.indexOf("четверт") > -1 || text.indexOf("четыр") > -1) num = 4;
                else if (text.indexOf("пят") > -1) num = 5;
                else if (text.indexOf("шест") > -1) num = 6;
                else if (text.indexOf("седьм") > -1 || text.indexOf("сем") > -1) num = 7;
                else if (text.indexOf("восьм") > -1 || text.indexOf("восем") > -1) num = 8;
                else if (text.indexOf("девят") > -1) num = 9;
                else if (text.indexOf("десят") > -1) num = 10;
            }

            var stepIdx = num - 1;

            // Проверяем, что такт в рамках нашей сетки
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
                // Если ничего не распознано
                $reactions.answer("Не расслышал номер такта. Повтори, пожалуйста, от 1 до 16.");
            }

    state: Reset
        q!: * (очисти*|сбрось*|удали*|сброс|убери*) * (всё|все|трек|бит|поле|сетку|такты) *
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
            $reactions.answer("Сетка очищена!");

    state: CatchAll
        event!: noMatch
        a: Извини, я не понял команду. Попробуй сказать "добавь бочку на пятый такт" или "очисти всё".