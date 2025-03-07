import React from 'react';
import { CategoryData, Transaction } from '../../types/banks';
import { SelectedTransactions, SortConfig } from '../../types/excel';

interface TransactionsTableProps {
  currentData: CategoryData;
  selectedCategory: string;
  selectedTransactions: SelectedTransactions;
  onTransactionSelect: (index: number) => void;
  onSelectAll: () => void;
  onSort: (key: keyof Transaction) => void;
  sortConfig: SortConfig;
  onTransferClick: () => void;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({
  currentData,
  selectedCategory,
  selectedTransactions,
  onTransactionSelect,
  onSelectAll,
  onSort,
  sortConfig,
  onTransferClick
}) => {
  const renderSortArrow = (key: keyof Transaction) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const renderAmount = (transaction: Transaction) => {
    const amount = Math.abs(transaction.amount).toFixed(2);
    const isExpense = transaction.isExpense;
    const color = isExpense ? 'text-white' : 'text-green-400';
    return (
      <span className={`font-medium ${color}`}>
        {isExpense ? '-' : '+'}{amount} ₽
      </span>
    );
  };

  return (
    <div className="mt-6 bg-gray-800 rounded-lg overflow-hidden shadow-xl">
      <div className="p-6 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {selectedCategory}
            </h3>
            <div className="space-y-1">
              <p className="text-gray-400">
                Всего транзакций: <span className="text-white">{currentData.transactions.length}</span>
              </p>
              <p className="text-gray-400">
                Общая сумма: <span className={currentData.total >= 0 ? 'text-green-400' : 'text-white'}>
                  {currentData.total >= 0 ? '+' : ''}{currentData.total.toFixed(2)} ₽
                </span>
              </p>
              {currentData.totalCashback > 0 && (
                <p className="text-gray-400">
                  Общий кэшбэк: <span className="text-blue-400">{currentData.totalCashback.toFixed(2)} ₽</span>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onTransferClick}
            disabled={!Object.values(selectedTransactions).some(Boolean)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              Object.values(selectedTransactions).some(Boolean)
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            Перенести выбранные
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900">
              <th className="px-6 py-3 border-b border-gray-700">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    onChange={onSelectAll}
                    checked={
                      currentData.transactions.length > 0 &&
                      currentData.transactions.every((_, index) => selectedTransactions[index])
                    }
                    className="rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700 cursor-pointer hover:text-white"
                onClick={() => onSort('date')}
              >
                Дата{renderSortArrow('date')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700 cursor-pointer hover:text-white"
                onClick={() => onSort('amount')}
              >
                Сумма{renderSortArrow('amount')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700 cursor-pointer hover:text-white"
                onClick={() => onSort('description')}
              >
                Описание{renderSortArrow('description')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
                Статус
              </th>
              {currentData.transactions.some(t => t.cashback !== undefined) && (
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700 cursor-pointer hover:text-white"
                  onClick={() => onSort('cashback')}
                >
                  Кэшбэк{renderSortArrow('cashback')}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {currentData.transactions.map((transaction, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-700 transition-colors ${
                  index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedTransactions[index] || false}
                      onChange={() => onTransactionSelect(index)}
                      className="rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {transaction.date}
                </td>
                <td className="px-6 py-4 text-sm">
                  {renderAmount(transaction)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {transaction.description}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {transaction.status}
                </td>
                {transaction.cashback !== undefined && (
                  <td className="px-6 py-4 text-sm text-blue-400">
                    {transaction.cashback.toFixed(2)} ₽
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsTable; 