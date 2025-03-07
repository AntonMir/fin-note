import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Categories } from '../types/banks';

interface TableState {
  categories: Categories;
}

const initialState: TableState = {
  categories: {}
};

const tableSlice = createSlice({
  name: 'tables',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Categories>) => {
      state.categories = action.payload;
    },
    loadStateFromJson: (state, action: PayloadAction<TableState>) => {
      state.categories = action.payload.categories;
    },
    resetState: (state) => {
      state.categories = {};
    }
  }
});

export const { setCategories, loadStateFromJson, resetState } = tableSlice.actions;

export default tableSlice.reducer; 