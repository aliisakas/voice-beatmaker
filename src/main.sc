theme: /

    state: Welcome
        q!: $regex</start>
        q!: *(запусти*|открой*|включи*|вруби*) * битмейкер*
        event!: RUN_APP
        a: Привет! Я твой голосовой битмейкер. Давай создадим трек. Какую команду выполнить?

    state: AddInstrument
        q!: * (добавь*|поставь*|включи*|сделай*) * (бочк*|кик*|kick|рабоч*|снеер*|снейр*|снэр*|снер*|snare|хэт*|хайхэт*|хай-хэт*|хай хэт*|тарелк*|hihat|hi-hat|hi hat|хлопок|хлопк*|клэп*|клеп*|clap) * [на] * так*
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
                // Если Салют прислал цифрами
                num = parseInt(match[0]);
            } else {
                // Ищем признаки чисел больше 19
                // Если есть хоть одно слово из этого списка, число точно больше 16
                if (text.match(/(двадцат|тридцат|сорок|пятьдесят|шестьдесят|семьдесят|восемьдесят|девяносто|сто|двест|трист|четырест|пятьсот|шестьсот|семьсот|восемьсот|девятьсот|сот|тысяч|миллион)/)) {
                    num = 999; 
                }
                // Если десятков/сотен нет, проверяем числа 11-19
                else if (text.match(/одиннадцат/)) num = 11;
                else if (text.match(/двенадцат/)) num = 12;
                else if (text.match(/тринадцат/)) num = 13;
                else if (text.match(/четырнадцат/)) num = 14;
                else if (text.match(/пятнадцат/)) num = 15;
                else if (text.match(/шестнадцат/)) num = 16;
                else if (text.match(/семнадцат/)) num = 17;
                else if (text.match(/восемнадцат/)) num = 18;
                else if (text.match(/девятнадцат/)) num = 19;
                
                else if (text.match(/перв|один/)) num = 1;
                else if (text.match(/втор|два|две/)) num = 2;
                else if (text.match(/трет|три/)) num = 3;
                else if (text.match(/четверт|четыр/)) num = 4;
                else if (text.match(/пят/)) num = 5;
                else if (text.match(/шест/)) num = 6;
                else if (text.match(/седьм|сем/)) num = 7;
                else if (text.match(/восьм|восем/)) num = 8;
                else if (text.match(/девят/)) num = 9;
                else if (text.match(/десят/)) num = 10;
            }

            // ЗАЩИТА ИНТЕРВАЛА
            if (num !== -1) {
                if (num >= 1 && num <= 16) {
                    var stepIdx = num - 1;

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
                    $reactions.answer("Сетка состоит только из шестнадцати тактов. Выбери число от 1 до 16.");
                }
            } else {
                $reactions.answer("Не расслышал номер. Скажи число от 1 до 16.");
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