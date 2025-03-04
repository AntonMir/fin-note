export interface Transaction {
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

export interface CategoryData {
  total: number;
  totalCashback: number;
  transactions: Transaction[];
}

export interface SelectedTransactions {
  [key: string]: boolean;
}

export interface SortConfig {
  key: 'date' | 'amount' | 'category' | 'description' | 'cardNumber' | 'status' | null;
  direction: 'asc' | 'desc' | null;
}

export interface TransferMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  categories: Record<string, CategoryData>;
  onTransfer: (targetCategory: string) => void;
  hasSelectedTransactions: boolean;
}

export interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (categoryName: string) => void;
}

export interface CategoryButtonsProps {
  categories: Record<string, CategoryData>;
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
  onSort: (key: SortConfig['key']) => void;
  sortConfig: SortConfig;
  onTransferClick: () => void;
} 