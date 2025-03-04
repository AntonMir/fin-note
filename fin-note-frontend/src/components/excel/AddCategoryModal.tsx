import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AddCategoryModalProps } from '../../types/excel';
import { STYLES } from '../../constants/excel';

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newCategoryName.trim()) return;
    onAdd(newCategoryName.trim());
    setNewCategoryName('');
  };

  return createPortal(
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <div className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className={`${STYLES.background} rounded-lg shadow-xl w-80`}>
          <div className={`p-4 border-b ${STYLES.border}`}>
            <h3 className={`text-lg font-medium ${STYLES.text}`}>
              Добавить категорию
            </h3>
          </div>
          <div className="p-4">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Название категории"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAdd();
                }
              }}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={onClose}
                className={`px-4 py-2 text-sm font-medium ${STYLES.textMuted} hover:text-white transition-colors`}
              >
                Отмена
              </button>
              <button
                onClick={handleAdd}
                disabled={!newCategoryName.trim()}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  newCategoryName.trim()
                    ? STYLES.button.primary
                    : STYLES.button.disabled
                }`}
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default AddCategoryModal; 