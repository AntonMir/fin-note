import { Transaction as BankTransaction, CategoryData as BankCategoryData, Categories } from './banks';

export type Transaction = BankTransaction;
export type CategoryData = BankCategoryData;

export interface SelectedTransactions {
  [key: number]: boolean;
}

export interface SortConfig {
  key: keyof Transaction | null;
  direction: 'asc' | 'desc' | null;
}

export interface TransferMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  categories: Categories;
  onTransfer: (targetCategory: string) => void;
  hasSelectedTransactions: boolean;
}

export interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (categoryName: string) => void;
}

export interface CategoryButtonsProps {
  categories: Categories;
  selectedCategory: string;
  onCategoryClick: (category: string, data: CategoryData) => void;
  onAddCategoryClick: () => void;
}

export interface TransactionsTableProps {
  currentData: CategoryData;
  selectedCategory: string;
  selectedTransactions: SelectedTransactions;
  onTransactionSelect: (index: number) => void;
  onSelectAll: () => void;
  onSort: (key: keyof Transaction) => void;
  sortConfig: SortConfig;
  onTransferClick: () => void;
} 