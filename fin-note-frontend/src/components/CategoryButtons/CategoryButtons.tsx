import React from 'react';
import { CategoryData } from '../../types/transaction';
import { BUDGET_CATEGORIES } from '../../constants/categories';

interface CategoryButtonsProps {
  shopCategories: { [key: string]: CategoryData };
  budgetCategories: { [key: string]: CategoryData };
  selectedCategory: string;
  onCategoryClick: (category: string, data: CategoryData) => void;
  onAddCategoryClick: () => void;
}

export const CategoryButtons: React.FC<CategoryButtonsProps> = ({
  shopCategories,
  budgetCategories,
  selectedCategory,
  onCategoryClick,
  onAddCategoryClick,
}) => {
  const allCategories = { ...shopCategories, ...budgetCategories };
  
  // Фильтруем категории, которые должны быть в "Нераспределенное"
  const filteredCategories = Object.entries(allCategories).filter(([category]) => 
    !['Маркетплейсы', 'Медицина', 'Одежда и обувь', 'Цифровые товары', 'Различные товары', 
      'Экосистема Яндекс', 'Детские товары', 'Дом и ремонт'].includes(category)
  );

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={onAddCategoryClick}
        className="px-4 py-2 rounded-md text-sm bg-green-600 text-white hover:bg-green-700 transition-colors"
      >
        + Добавить категорию
      </button>
      {filteredCategories.map(([category, data]) => {
        const budgetCategory = BUDGET_CATEGORIES.find(bc => bc.name === category);
        const isCustomCategory = budgetCategory?.isCustom;
        const amount = data.total;
        const formattedAmount = amount.toLocaleString('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          signDisplay: 'always'
        });
        
        return (
          <button
            key={category}
            onClick={() => onCategoryClick(category, data)}
            className={`px-4 py-2 rounded-md text-sm transition-colors flex items-center
              ${selectedCategory === category
                ? isCustomCategory 
                  ? 'bg-yellow-600 text-white'
                  : 'bg-indigo-600 text-white'
                : isCustomCategory
                  ? 'bg-yellow-700/30 text-gray-300 hover:bg-yellow-700/50'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
          >
            <span className="font-bold">{category}</span>
            <span className="ml-2 text-xs opacity-75">
              {formattedAmount}
              <span className="ml-1 font-bold">({data.transactions.length})</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}; 