import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Transaction {
  date: string;
  amount: number;
  description: string;
  category: string;
  mccCode: string;
  status: string;
  paymentType: string;
  cardNumber: string;
  cashback: number;
}

interface CategoryData {
  total: number;
  totalCashback: number;
  transactions: Transaction[];
}

interface TableState {
  categories: { [key: string]: CategoryData };
}

const initialState: TableState = {
  categories: {},
};

const tableSlice = createSlice({
  name: 'tables',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<{ [key: string]: CategoryData }>) => {
      state.categories = action.payload;
    },
    loadStateFromJson: (state, action: PayloadAction<TableState>) => {
      state.categories = action.payload.categories;
    },
    resetState: (state) => {
      state.categories = {};
    },
  },
});

export const { setCategories, loadStateFromJson, resetState } = tableSlice.actions;

export default tableSlice.reducer; 