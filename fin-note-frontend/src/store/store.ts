import { configureStore } from '@reduxjs/toolkit';
import tableReducer from './tableSlice';

// Загрузка начального состояния из localStorage
const loadState = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.email) return undefined;

    const savedState = localStorage.getItem(`fin-note-state-${user.email}`);
    if (savedState === null) return undefined;
    
    const state = JSON.parse(savedState);
    return {
      tables: {
        shopCategories: state.shopCategories || {},
        budgetCategories: state.budgetCategories || {},
        transferHistory: state.transferHistory || []
      }
    };
  } catch (err) {
    console.error('Error loading state:', err);
    return undefined;
  }
};

export const store = configureStore({
  reducer: {
    tables: tableReducer,
  },
  preloadedState: loadState()
});

// Подписка на изменения store для сохранения состояния
store.subscribe(() => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.email) return;

    const state = store.getState();
    localStorage.setItem(`fin-note-state-${user.email}`, JSON.stringify({
      shopCategories: state.tables.shopCategories,
      budgetCategories: state.tables.budgetCategories,
      transferHistory: state.tables.transferHistory
    }));
  } catch (err) {
    console.error('Error saving state:', err);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 