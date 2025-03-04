import React from 'react';

interface AddCategoryModalProps {
  isOpen: boolean;
  categoryName: string;
  onCategoryNameChange: (name: string) => void;
  onAdd: () => void;
  onClose: () => void;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  categoryName,
  onCategoryNameChange,
  onAdd,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">Добавить новую категорию</h3>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => onCategoryNameChange(e.target.value)}
          placeholder="Название категории"
          className="w-full px-4 py-2 rounded-md bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:border-indigo-500"
        />
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm bg-gray-700 text-gray-300 hover:bg-gray-600"
          >
            Отмена
          </button>
          <button
            onClick={onAdd}
            className="px-4 py-2 rounded-md text-sm bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
}; 