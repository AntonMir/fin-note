import React from 'react';
import { CategoryData, SortConfig, SelectedTransactions } from '../../types/transaction';

interface TransactionsTableProps {
  data: CategoryData;
  selectedCategory: string;
  selectedTransactions: SelectedTransactions;
  sortConfig: SortConfig;
  onTransactionSelect: (index: number) => void;
  onSelectAll: () => void;
  onSort: (key: SortConfig['key']) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  data,
  selectedCategory,
  selectedTransactions,
  sortConfig,
  onTransactionSelect,
  onSelectAll,
  onSort,
}) => {
  const allSelected = data.transactions.every((_, index) => selectedTransactions[index]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              №
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                className="h-4 w-4 text-indigo-600 rounded border-gray-600 bg-gray-700"
              />
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-indigo-400"
              onClick={() => onSort('date')}
            >
              Дата
              {sortConfig.key === 'date' && (
                <span className="ml-1">
                  {sortConfig.direction === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-indigo-400"
              onClick={() => onSort('amount')}
            >
              Сумма
              {sortConfig.key === 'amount' && (
                <span className="ml-1">
                  {sortConfig.direction === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-indigo-400"
              onClick={() => onSort('category')}
            >
              Категория
              {sortConfig.key === 'category' && (
                <span className="ml-1">
                  {sortConfig.direction === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </th>
            {(selectedCategory === 'P2P переводы' || selectedCategory === 'Пополнения') ? (
              <>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-indigo-400"
                  onClick={() => onSort('description')}
                >
                  Кто
                  {sortConfig.key === 'description' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-indigo-400"
                  onClick={() => onSort('status')}
                >
                  Статус
                  {sortConfig.key === 'status' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              </>
            ) : (
              <>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-indigo-400"
                  onClick={() => onSort('description')}
                >
                  Описание
                  {sortConfig.key === 'description' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-indigo-400"
                  onClick={() => onSort('cardNumber')}
                >
                  Карта
                  {sortConfig.key === 'cardNumber' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {data.transactions.map((transaction, index) => (
            <tr 
              key={index} 
              className="hover:bg-gray-700 border-b border-gray-700"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                {index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedTransactions[index] || false}
                  onChange={() => onTransactionSelect(index)}
                  className="h-4 w-4 text-indigo-600 rounded border-gray-600 bg-gray-700"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {transaction.date}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {transaction.amount.toLocaleString('ru-RU', {
                  style: 'currency',
                  currency: 'RUB',
                  signDisplay: 'always'
                })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {transaction.originalCategory}
              </td>
              {(selectedCategory === 'P2P переводы' || selectedCategory === 'Пополнения') ? (
                <>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {transaction.amount > 0 ? 'Получено' : 'Отправлено'}
                  </td>
                </>
              ) : (
                <>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {transaction.cardNumber}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 