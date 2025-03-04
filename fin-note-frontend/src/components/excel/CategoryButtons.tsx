import React from 'react';
import { CategoryButtonsProps } from '../../types/excel';
import { STYLES, CURRENCY_FORMAT_OPTIONS } from '../../constants/excel';

const CategoryButtons: React.FC<CategoryButtonsProps> = ({
  categories,
  selectedCategory,
  onCategoryClick,
  onAddCategoryClick
}) => {
  if (!categories || Object.keys(categories).length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className={`text-lg font-medium ${STYLES.text}`}>Категории:</h3>
        <button
          onClick={onAddCategoryClick}
          className={`px-4 py-2 text-sm font-medium ${STYLES.button.primary} rounded-md transition-colors`}
        >
          Добавить категорию
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {Object.entries(categories).map(([category, data]) => (
          <button
            key={category}
            onClick={() => onCategoryClick(category, data)}
            className={`px-4 py-2 rounded-lg text-left transition-colors flex justify-between items-center ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white'
                : `${STYLES.background} ${STYLES.textMuted} ${STYLES.hover}`
            }`}
          >
            <span className="font-medium truncate">{category}</span>
            <span className={`ml-2 text-base font-bold whitespace-nowrap ${
              data.total >= 0 ? STYLES.positiveAmount : STYLES.negativeAmount
            }`}>
              {data.total.toLocaleString('ru-RU', CURRENCY_FORMAT_OPTIONS)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryButtons; 