export interface Transaction {
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

export interface CategoryData {
  total: number;
  totalCashback: number;
  transactions: Transaction[];
}

export interface BudgetCategory {
  name: string;
  sourceCategories: string[];
  isCustom?: boolean;
}

export interface SelectedTransactions {
  [key: string]: boolean;
}

export interface SortConfig {
  key: 'date' | 'amount' | 'category' | 'description' | 'cardNumber' | 'status' | null;
  direction: 'asc' | 'desc' | null;
} 