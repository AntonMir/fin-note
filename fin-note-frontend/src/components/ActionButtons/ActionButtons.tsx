import React from 'react';

interface ActionButtonsProps {
  hasSelectedTransactions: boolean;
  allTransactionsSelected: boolean;
  onSelectAll: () => void;
  onTransfer: () => void;
  onDelete: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  hasSelectedTransactions,
  allTransactionsSelected,
  onSelectAll,
  onTransfer,
  onDelete,
}) => {
  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={onSelectAll}
        className="px-3 py-1 text-sm font-medium text-gray-300 bg-gray-700 rounded hover:bg-gray-600"
      >
        {allTransactionsSelected ? 'Снять выделение' : 'Выбрать все'}
      </button>
      
      <button
        onClick={onTransfer}
        disabled={!hasSelectedTransactions}
        className={`px-3 py-1 text-sm font-medium rounded ${
          hasSelectedTransactions
            ? 'text-gray-300 bg-blue-600 hover:bg-blue-500'
            : 'text-gray-500 bg-gray-700 cursor-not-allowed'
        }`}
      >
        Перенести
      </button>
      
      <button
        onClick={onDelete}
        disabled={!hasSelectedTransactions}
        className={`px-3 py-1 text-sm font-medium rounded ${
          hasSelectedTransactions
            ? 'text-gray-300 bg-red-600 hover:bg-red-500'
            : 'text-gray-500 bg-gray-700 cursor-not-allowed'
        }`}
      >
        Удалить
      </button>
    </div>
  );
}; 