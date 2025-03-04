import React from 'react';
import { TransactionsTableProps } from '../../types/excel';
import { STYLES, CURRENCY_FORMAT_OPTIONS, CURRENCY_FORMAT_OPTIONS_WITH_SIGN, TABLE_COLUMNS } from '../../constants/excel';

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
  if (!currentData) return null;

  const allSelected = currentData.transactions.every((_, index) => selectedTransactions[index]);
  const hasSelectedTransactions = Object.values(selectedTransactions).some(isSelected => isSelected);
  
  const getSelectedTotal = () => {
    return currentData.transactions
      .filter((_, index) => selectedTransactions[index])
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  };

  const formatNumber = (value: number | null | undefined) => {
    const safeValue = typeof value === 'number' ? value : 0;
    return safeValue.toLocaleString('ru-RU', CURRENCY_FORMAT_OPTIONS);
  };

  const formatNumberWithSign = (value: number | null | undefined) => {
    const safeValue = typeof value === 'number' ? value : 0;
    return safeValue.toLocaleString('ru-RU', CURRENCY_FORMAT_OPTIONS_WITH_SIGN);
  };

  return (
    <div className={`${STYLES.background} rounded-lg shadow overflow-hidden mb-8`}>
      <div className={`p-6 border-b ${STYLES.border}`}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className={`text-xl font-semibold ${STYLES.text}`}>{selectedCategory}</h3>
            <p className={STYLES.textDimmed}>Количество транзакций: {currentData.transactions.length}</p>
            <p className={`text-base font-medium mt-2 ${STYLES.text}`}>
              Общая сумма: {' '}
              <span className={`text-lg font-bold ${
                (currentData.total || 0) >= 0 ? STYLES.positiveAmount : STYLES.negativeAmount
              }`}>
                {formatNumber(currentData.total)}
              </span>
            </p>
            <p className={`text-base font-medium ${STYLES.text}`}>
              Общий кэшбэк: {' '}
              <span className={`text-lg font-bold ${STYLES.cashback}`}>
                {formatNumber(currentData.totalCashback)}
              </span>
            </p>
            {hasSelectedTransactions && (
              <p className={`text-base font-medium mt-2 ${STYLES.text}`}>
                Выбрано: {' '}
                <span className={`text-lg font-bold ${STYLES.selected}`}>
                  {formatNumber(getSelectedTotal())}
                </span>
              </p>
            )}
          </div>
          <button
            onClick={onTransferClick}
            disabled={!hasSelectedTransactions}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              hasSelectedTransactions
                ? STYLES.button.primary
                : STYLES.button.disabled
            }`}
          >
            Перенести
          </button>
        </div>
      </div>
      <div className="overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto relative">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className={`${STYLES.backgroundDark} sticky top-0 z-10`}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${STYLES.textMuted} uppercase tracking-wider ${STYLES.backgroundDark}`}>
                №
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${STYLES.textMuted} ${STYLES.backgroundDark}`}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="h-4 w-4 text-indigo-600 rounded border-gray-600"
                />
              </th>
              {TABLE_COLUMNS.map(column => (
                <th 
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium ${STYLES.textMuted} uppercase tracking-wider cursor-pointer hover:text-indigo-400 ${STYLES.backgroundDark}`}
                  onClick={() => onSort(column.key as any)}
                >
                  {column.label}
                  {sortConfig.key === column.key && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`${STYLES.background} divide-y ${STYLES.border}`}>
            {currentData.transactions.map((transaction, index) => (
              <tr 
                key={index} 
                className={`${STYLES.hover} border-b ${STYLES.border}`}
              >
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${STYLES.textDimmed}`}>
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedTransactions[index] || false}
                    onChange={() => onTransactionSelect(index)}
                    className="h-4 w-4 text-indigo-600 rounded border-gray-600"
                  />
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${STYLES.textMuted}`}>
                  {transaction.date}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-base font-bold ${
                  (transaction.amount || 0) > 0 ? STYLES.positiveAmount : STYLES.negativeAmount
                }`}>
                  {formatNumberWithSign(transaction.amount)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${STYLES.textMuted}`}>
                  {transaction.description}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${STYLES.textMuted}`}>
                  {transaction.cardNumber}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${STYLES.textMuted}`}>
                  {transaction.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsTable; 