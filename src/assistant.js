import { createAssistant, createSmartappDebugger } from '@salutejs/client';

/**
 * Инициализирует ассистента Сбера.
 * В dev-режиме запускается SmartappDebugger с панелью ввода,
 * в production — настоящий ассистент Салют.
 *
 * @param {function} getState — функция, возвращающая текущее состояние приложения
 * @returns {object} экземпляр ассистента
 */
export function initializeAssistant(getState) {
  if (process.env.NODE_ENV === 'development') {
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN ?? '',
      initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
      getState,
      nativePanel: {
        defaultText: 'Говорите!',
        screenshotMode: false,
        tabIndex: -1,
      },
    });
  }

  return createAssistant({ getState });
}
