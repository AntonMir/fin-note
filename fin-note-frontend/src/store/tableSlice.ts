import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Transaction {
  date: string;
  amount: number;
  description: string;
  category: string;
  originalCategory: string;
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
  shopCategories: { [key: string]: CategoryData };
  budgetCategories: { [key: string]: CategoryData };
  transferHistory: {
    timestamp: string;
    fromCategory: string;
    toCategory: string;
    transactions: Transaction[];
  }[];
}

const initialState: TableState = {
  shopCategories: {},
  budgetCategories: {},
  transferHistory: [],
};

const tableSlice = createSlice({
  name: 'tables',
  initialState,
  reducers: {
    setShopCategories: (state, action: PayloadAction<{ [key: string]: CategoryData }>) => {
      state.shopCategories = action.payload;
    },
    setBudgetCategories: (state, action: PayloadAction<{ [key: string]: CategoryData }>) => {
      state.budgetCategories = action.payload;
    },
    addTransferToHistory: (state, action: PayloadAction<{
      fromCategory: string;
      toCategory: string;
      transactions: Transaction[];
    }>) => {
      state.transferHistory.push({
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    loadStateFromJson: (state, action: PayloadAction<TableState>) => {
      return action.payload;
    },
    resetState: () => initialState,
  },
});

export const {
  setShopCategories,
  setBudgetCategories,
  addTransferToHistory,
  loadStateFromJson,
  resetState,
} = tableSlice.actions;

export default tableSlice.reducer; 