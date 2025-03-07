import { Transaction, TinkoffRow, SberbankRow, Categories } from '../types/banks';

export const processTinkoffRow = (row: TinkoffRow): Transaction => {
  const amount = parseFloat(String(row['Сумма операции']));
  return {
    date: row['Дата операции'] || row['Дата платежа'],
    amount: amount,
    description: row['Описание'],
    category: row['Категория'] || 'Прочее',
    mccCode: row['MCC'],
    status: row['Статус'],
    paymentType: amount < 0 ? 'Расходы' : 'Доходы',
    cardNumber: row['Номер карты'],
    cashback: parseFloat(String(row['Бонусы'] || 0)),
    isExpense: amount < 0
  };
};

export const processSberbankRow = (row: SberbankRow): Transaction => {
  const isExpense = row['Тип операции'] === 'Расходы';
  const amount = parseFloat(String(row['Сумма']));
  return {
    date: row['Дата'],
    amount: isExpense ? -Math.abs(amount) : Math.abs(amount),
    description: row['Описание'],
    category: row['Категория'] || 'Прочее',
    status: row['Состояние'],
    paymentType: row['Тип операции'],
    cardNumber: row['Номер счета/карты списания'],
    isExpense
  };
};

export const groupTransactionsByCategory = (transactions: Transaction[]): Categories => {
  return transactions.reduce((acc: Categories, transaction) => {
    if (!acc[transaction.category]) {
      acc[transaction.category] = {
        total: 0,
        totalCashback: 0,
        transactions: []
      };
    }
    
    acc[transaction.category].total += transaction.amount;
    acc[transaction.category].totalCashback += transaction.cashback || 0;
    acc[transaction.category].transactions.push(transaction);
    
    return acc;
  }, {});
};

export const formatDate = (dateStr: string): string => {
  try {
    const [day, month, year] = dateStr.split('.');
    if (day && month && year) {
      return `${day}.${month}.${year}`;
    }
    return dateStr;
  } catch (error) {
    console.error('Error parsing date:', error, { dateStr });
    return dateStr;
  }
}; 