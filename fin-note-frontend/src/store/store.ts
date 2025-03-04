import { configureStore } from '@reduxjs/toolkit';
import tableReducer from './tableSlice';

// Загрузка состояния из localStorage
export const loadState = (email?: string) => {
  try {
    if (!email) return undefined;

    const serializedState = localStorage.getItem(`fin-note-state-${email}`);
    if (serializedState === null) {
      return undefined;
    }
    const state = JSON.parse(serializedState);
    return {
      tables: {
        categories: state.categories || {}
      }
    };
  } catch (err) {
    console.error('Error loading state:', err);
    return undefined;
  }
};

// Создание store
export const store = configureStore({
  reducer: {
    tables: tableReducer,
  },
  preloadedState: loadState(undefined)
});

// Функция для получения текущего состояния
export const getCurrentState = () => {
  return {
    categories: store.getState().tables.categories
  };
};

// Сохранение состояния в localStorage
export const saveState = (email?: string) => {
  try {
    if (!email) return;

    const currentState = getCurrentState();
    localStorage.setItem(`fin-note-state-${email}`, JSON.stringify(currentState));

    // Сохраняем состояние в sessionStorage для восстановления при перезагрузке
    sessionStorage.setItem(`fin-note-state-${email}`, JSON.stringify(currentState));
  } catch (err) {
    console.error('Error saving state:', err);
  }
};

// Восстановление состояния из sessionStorage при перезагрузке
export const restoreStateFromSession = (email?: string) => {
  try {
    if (!email) return;

    const sessionState = sessionStorage.getItem(`fin-note-state-${email}`);
    if (sessionState) {
      const state = JSON.parse(sessionState);
      store.dispatch({ type: 'tables/loadStateFromJson', payload: { categories: state.categories } });
    }
  } catch (err) {
    console.error('Error restoring state from session:', err);
  }
};

// Подписка на изменения store для автоматического сохранения
let saveStateTimeout: NodeJS.Timeout;
store.subscribe(() => {
  if (saveStateTimeout) {
    clearTimeout(saveStateTimeout);
  }
  
  // Используем debounce для предотвращения частых сохранений
  saveStateTimeout = setTimeout(() => {
    const state = store.getState();
    if (state.tables.categories && Object.keys(state.tables.categories).length > 0) {
      const email = localStorage.getItem('currentUser');
      if (email) {
        saveState(email);
      }
    }
  }, 1000);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 