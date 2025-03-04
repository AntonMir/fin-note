import React from 'react';
import { createPortal } from 'react-dom';
import { TransferMenuProps } from '../../types/excel';
import { STYLES } from '../../constants/excel';

const TransferMenu: React.FC<TransferMenuProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  categories,
  onTransfer,
  hasSelectedTransactions
}) => {
  if (!isOpen) return null;

  const availableCategories = Object.keys(categories).filter(category => category !== selectedCategory);

  return createPortal(
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <div className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className={`${STYLES.background} rounded-lg shadow-xl w-64`}>
          <div className={`p-4 border-b ${STYLES.border}`}>
            <h3 className={`text-lg font-medium ${STYLES.text}`}>
              Перенести в категорию
            </h3>
          </div>
          <div className="py-2 max-h-60 overflow-y-auto">
            {availableCategories.map(category => (
              <button
                key={category}
                onClick={() => onTransfer(category)}
                disabled={!hasSelectedTransactions}
                className={`w-full px-4 py-2 text-left ${STYLES.hover} transition-colors ${
                  hasSelectedTransactions ? STYLES.textMuted : 'text-gray-500 cursor-not-allowed'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default TransferMenu; 