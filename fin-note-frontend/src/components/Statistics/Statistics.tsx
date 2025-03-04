import React from 'react';
import { CategoryData } from '../../types/transaction';

interface StatisticsProps {
  shopCategories: { [key: string]: CategoryData };
  budgetCategories: { [key: string]: CategoryData };
}

export const Statistics: React.FC<StatisticsProps> = ({
  shopCategories,
  budgetCategories
}) => {
  const allCategories = { ...shopCategories, ...budgetCategories };
  let totalIncome = 0;
  let totalExpense = 0;

  Object.entries(allCategories).forEach(([category, data]) => {
    if (category !== 'P2P переводы' && category !== 'Пополнения') {
      data.transactions.forEach(transaction => {
        if (transaction.amount > 0) {
          totalIncome += transaction.amount;
        } else {
          totalExpense += Math.abs(transaction.amount);
        }
      });
    }
  });

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold text-gray-100 mb-4">Общая статистика</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">Общий приход (без учета P2P и пополнений)</p>
          <p className="text-2xl font-bold text-green-400">
            {totalIncome.toLocaleString('ru-RU', {
              style: 'currency',
              currency: 'RUB'
            })}
          </p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">Общий расход (без учета P2P и пополнений)</p>
          <p className="text-2xl font-bold text-red-400">
            {totalExpense.toLocaleString('ru-RU', {
              style: 'currency',
              currency: 'RUB'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}; 