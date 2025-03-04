import React from 'react';
import { createPortal } from 'react-dom';
import { CategoryData } from '../../types/transaction';
import { UNALLOCATED_SOURCE_CATEGORIES } from '../../constants/categories';

interface TransferMenuProps {
  isOpen: boolean;
  selectedCategory: string;
  shopCategories: { [key: string]: CategoryData };
  budgetCategories: { [key: string]: CategoryData };
  hasSelectedTransactions: boolean;
  onTransfer: (targetCategory: string) => void;
  onClose: () => void;
}

export const TransferMenu: React.FC<TransferMenuProps> = ({
  isOpen,
  selectedCategory,
  shopCategories,
  budgetCategories,
  hasSelectedTransactions,
  onTransfer,
  onClose,
}) => {
  if (!isOpen) return null;

  const allCategories = { ...shopCategories, ...budgetCategories };
  
  // Фильтруем категории, которые должны быть в "Нераспределенное"
  const availableCategories = Object.keys(allCategories)
    .filter(category => 
      !UNALLOCATED_SOURCE_CATEGORIES.includes(category) && 
      category !== selectedCategory
    );

  const menuContent = (
    <div className="fixed z-50" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
      <div className="w-64 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5">
        <div className="py-1" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
          <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700 sticky top-0 bg-gray-800">
            Перенести в категорию:
          </div>
          {availableCategories.map(category => (
            <button
              key={category}
              onClick={() => onTransfer(category)}
              disabled={!hasSelectedTransactions}
              className={`block w-full text-left px-4 py-2 text-sm ${
                hasSelectedTransactions
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-500 cursor-not-allowed'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      {menuContent}
    </>,
    document.body
  );
}; 