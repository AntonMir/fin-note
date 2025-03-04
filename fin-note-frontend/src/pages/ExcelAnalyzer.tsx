import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setShopCategories, 
  setBudgetCategories, 
  addTransferToHistory,
  loadStateFromJson,
  resetState
} from '../store/tableSlice';
import { RootState, store } from '../store/store';
import { createPortal } from 'react-dom';

interface Transaction {
  date: string;
  amount: number;
  description: string;
  category: string;
  originalCategory: string;
  mccCode: string;
  status: string;
  paymentType: string;
  cardNumber: string;
  cashback: number;
}

interface CategoryData {
  total: number;
  totalCashback: number;
  transactions: Transaction[];
}

interface BudgetCategory {
  name: string;
  sourceCategories: string[];
  isCustom?: boolean;
}

const CATEGORY_MAPPING: { [key: string]: string } = {
  'Супермаркеты': 'Продукты',
  'Фастфуд': 'Продукты',
  'Рестораны': 'Продукты',
  
  'Такси': 'Проезд',
  'Каршеринг': 'Проезд',
  'Местный транспорт': 'Проезд',
  'Аренда авто': 'Проезд',
  'Топливо': 'Проезд',
  'Автоуслуги': 'Проезд',
  
  'P2P': 'P2P переводы',
  'Пополнения': 'Пополнения',
  'Бонусы': 'Кэш',
  'Услуги банка': 'Кэш',
};

// Категории, которые должны попадать в "Нераспределенное"
const UNALLOCATED_SOURCE_CATEGORIES = [
  'Маркетплейсы',
  'Медицина',
  'Одежда и обувь',
  'Цифровые товары',
  'Различные товары',
  'Экосистема Яндекс',
  'Детские товары',
  'Дом и ремонт'
];

const BUDGET_CATEGORIES: BudgetCategory[] = [
  { name: 'Телефон/Интернет', sourceCategories: ['Связь'] },
  { name: 'Продукты', sourceCategories: ['Продукты'] },
  { name: 'Проезд', sourceCategories: ['Проезд'] },
  { name: 'Гайка', sourceCategories: ['Животные'], isCustom: true },
  { name: 'Личные Антон', sourceCategories: [], isCustom: true },
  { name: 'Личные Алена', sourceCategories: [], isCustom: true },
  { name: 'Вкусняшки', sourceCategories: [], isCustom: true },
  { name: 'Здоровье', sourceCategories: ['Здоровье'] },
  { name: 'Мама', sourceCategories: [], isCustom: true },
  { name: 'Квартплата', sourceCategories: [], isCustom: true },
  { name: 'Кредит', sourceCategories: ['Кредиты'] },
  { name: 'Кэш', sourceCategories: ['Кэш'], isCustom: true },
];

interface SelectedTransactions {
  [key: string]: boolean;
}

interface SortConfig {
  key: 'date' | 'amount' | 'category' | 'description' | 'cardNumber' | 'status' | null;
  direction: 'asc' | 'desc' | null;
}

const ExcelAnalyzer: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { shopCategories, budgetCategories } = useSelector((state: RootState) => state.tables);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentData, setCurrentData] = useState<CategoryData | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<SelectedTransactions>({});
  const [isTransferMenuOpen, setIsTransferMenuOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });

  // Инициализация состояния при монтировании
  useEffect(() => {
    if (!user?.email) return;

    const state = store.getState();
    if (Object.keys(state.tables.shopCategories).length > 0) {
      // Если есть данные в Redux store, инициализируем локальное состояние
      const firstCategory = Object.keys(state.tables.shopCategories)[0];
      if (firstCategory) {
        setSelectedCategory(firstCategory);
        setCurrentData(state.tables.shopCategories[firstCategory]);
      }
    }
  }, [user?.email]);

  // Загрузка локального состояния компонента
  useEffect(() => {
    if (!user?.email) return;

    const savedState = localStorage.getItem(`fin-note-local-state-${user.email}`);
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setSelectedCategory(state.selectedCategory || '');
        setCurrentData(state.currentData || null);
        setSortConfig(state.sortConfig || { key: null, direction: null });
      } catch (error) {
        console.error('Error loading local state:', error);
      }
    }
  }, [user?.email]);

  // Сохранение локального состояния компонента
  useEffect(() => {
    if (!user?.email) return;

    const localState = {
      selectedCategory,
      currentData,
      sortConfig
    };

    localStorage.setItem(`fin-note-local-state-${user.email}`, JSON.stringify(localState));
  }, [user?.email, selectedCategory, currentData, sortConfig]);

  const handleDownloadJson = () => {
    const state = {
      shopCategories,
      budgetCategories,
      transferHistory: [],
    };
    
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = String(currentDate.getFullYear()).slice(-2);
    const formattedDate = `${day}.${month}.${year}`;
    
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Подсчет бюджета от ${formattedDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    dispatch(resetState());
    setSelectedCategory('');
    setCurrentData(null);
    setSelectedTransactions({});
    setIsTransferMenuOpen(false);
    setIsAddCategoryModalOpen(false);
    setSortConfig({ key: null, direction: null });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const state = JSON.parse(content);
        dispatch(loadStateFromJson(state));
      } catch (error) {
        console.error('Error loading JSON:', error);
      }
    };
    reader.readAsText(file);
  };

  const processExcelFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      dispatch(resetState());
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const processedTransactions = jsonData.map((row: any) => {
        const originalCategory = row['Категория'] || 'Прочее';
        // Определяем категорию на основе типа операции и оригинальной категории
        let mappedCategory = originalCategory;
        
        if (originalCategory === 'P2P' || originalCategory === 'Переводы') {
          mappedCategory = 'P2P переводы';
        } else if (originalCategory === 'Пополнения') {
          mappedCategory = 'Пополнения';
        } else {
          // Для остальных категорий используем существующий маппинг
          mappedCategory = UNALLOCATED_SOURCE_CATEGORIES.includes(originalCategory) 
            ? originalCategory 
            : CATEGORY_MAPPING[originalCategory] || originalCategory;
        }
        
        // Форматирование даты
        const operationDate = row['Дата операции'];
        const paymentDate = row['Дата платежа'];
        let dateToUse = '';
        
        try {
          if (operationDate) {
            // Парсим дату в формате DD.MM.YYYY
            const [day, month, year] = operationDate.split('.');
            if (day && month && year) {
              const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              if (!isNaN(date.getTime())) {
                dateToUse = `${day}.${month}.${year}`;
              }
            }
          }
          
          if (!dateToUse && paymentDate) {
            // Парсим дату платежа в том же формате
            const [day, month, year] = paymentDate.split('.');
            if (day && month && year) {
              const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              if (!isNaN(date.getTime())) {
                dateToUse = `${day}.${month}.${year}`;
              }
            }
          }
        } catch (error) {
          console.error('Error parsing date:', error, { operationDate, paymentDate });
        }

        // Определение описания
        let description = '';
        if (mappedCategory === 'Переводы') {
          description = row['Описание'] || row['Контрагент'] || '';
        } else {
          description = row['Описание'] || row['MCC Описание'] || row['Контрагент'] || '';
        }
        
        return {
          date: dateToUse,
          amount: parseFloat(row['Сумма операции'] || 0),
          description: description,
          category: mappedCategory,
          originalCategory: originalCategory,
          mccCode: row['MCC'] || '',
          status: row['Статус'] || '',
          paymentType: row['Тип операции'] || '',
          cardNumber: row['Номер карты'] || '',
          cashback: parseFloat(row['Кэшбэк'] || 0)
        };
      })
      .filter(transaction => Math.abs(transaction.amount) > 1 && transaction.category !== 'Проценты');

      // Обработка категорий магазинов
      const shopData = processedTransactions.reduce((acc: { [key: string]: CategoryData }, curr) => {
        let category = curr.category;

        if (!acc[category]) {
          acc[category] = { total: 0, totalCashback: 0, transactions: [] };
        }
        acc[category].total += curr.amount;
        acc[category].totalCashback += curr.cashback;
        acc[category].transactions.push(curr);
        return acc;
      }, {});

      // Удаляем категорию "Животные" из shopData, так как она будет обработана в budgetData
      delete shopData['Животные'];

      dispatch(setShopCategories(shopData));

      // Обработка бюджетных категорий
      const budgetData = processedTransactions.reduce((acc: { [key: string]: CategoryData }, curr) => {
        let budgetCategory = 'Нераспределенное';
        
        // Специальная обработка для категории "Животные"
        if (curr.category === 'Животные') {
          budgetCategory = 'Гайка';
        } else if (UNALLOCATED_SOURCE_CATEGORIES.includes(curr.originalCategory)) {
          budgetCategory = 'Нераспределенное';
        } else {
          for (const category of BUDGET_CATEGORIES) {
            if (category.sourceCategories.includes(curr.category)) {
              budgetCategory = category.name;
              break;
            }
          }
        }

        if (!acc[budgetCategory]) {
          acc[budgetCategory] = { total: 0, totalCashback: 0, transactions: [] };
        }
        acc[budgetCategory].total += curr.amount;
        acc[budgetCategory].totalCashback += curr.cashback;
        acc[budgetCategory].transactions.push(curr);
        return acc;
      }, {});

      dispatch(setBudgetCategories(budgetData));
      
      // Выбираем первую доступную категорию
      const firstCategory = Object.keys(shopData)[0];
      if (firstCategory) {
        setSelectedCategory(firstCategory);
        setCurrentData(shopData[firstCategory]);
      }
    };
    reader.readAsBinaryString(file);
  }, [dispatch]);

  const handleCategoryClick = (category: string, data: CategoryData) => {
    setSelectedCategory(category);
    setCurrentData(data);
  };

  const handleTransactionSelect = (transactionIndex: number) => {
    setSelectedTransactions(prev => ({
      ...prev,
      [transactionIndex]: !prev[transactionIndex]
    }));
  };

  const handleSelectAll = () => {
    if (!currentData) return;
    
    const allSelected = currentData.transactions.every((_, index) => selectedTransactions[index]);
    const newSelected: SelectedTransactions = {};
    
    currentData.transactions.forEach((_, index) => {
      newSelected[index] = !allSelected;
    });
    
    setSelectedTransactions(newSelected);
  };

  const handleTransferTransactions = (targetCategory: string) => {
    if (!currentData) return;

    const selectedIndices = Object.entries(selectedTransactions)
      .filter(([_, isSelected]) => isSelected)
      .map(([index]) => parseInt(index));

    if (selectedIndices.length === 0) return;

    // Получаем переносимые транзакции
    const transferringTransactions = selectedIndices.map(index => currentData.transactions[index]);
    
    // Получаем оставшиеся транзакции (фильтруем исходный массив)
    const remainingTransactions = currentData.transactions.filter((_, index) => !selectedIndices.includes(index));

    // Add transfer to history
    dispatch(addTransferToHistory({
      fromCategory: selectedCategory,
      toCategory: targetCategory,
      transactions: transferringTransactions,
    }));

    // Обновляем состояние в зависимости от типа категорий
    const updatedSourceData = {
      total: remainingTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0),
      totalCashback: remainingTransactions.reduce((sum, t) => sum + t.cashback, 0),
      transactions: remainingTransactions
    };

    const transferTotal = transferringTransactions.reduce((sum, t) => sum + t.amount, 0);
    const transferCashback = transferringTransactions.reduce((sum, t) => sum + t.cashback, 0);

    // Создаем новые объекты состояния
    const newShopCategories = { ...shopCategories };
    const newBudgetCategories = { ...budgetCategories };

    // Обновляем исходные категории
    if (selectedCategory in shopCategories) {
      newShopCategories[selectedCategory] = updatedSourceData;
    }
    if (selectedCategory in budgetCategories) {
      newBudgetCategories[selectedCategory] = updatedSourceData;
    }

    // Обновляем целевые категории
    if (targetCategory in shopCategories) {
      const targetData = shopCategories[targetCategory] || { total: 0, totalCashback: 0, transactions: [] };
      newShopCategories[targetCategory] = {
        total: targetData.total + transferTotal,
        totalCashback: targetData.totalCashback + transferCashback,
        transactions: [...targetData.transactions, ...transferringTransactions]
      };
    }
    if (targetCategory in budgetCategories) {
      const targetData = budgetCategories[targetCategory] || { total: 0, totalCashback: 0, transactions: [] };
      newBudgetCategories[targetCategory] = {
        total: targetData.total + transferTotal,
        totalCashback: targetData.totalCashback + transferCashback,
        transactions: [...targetData.transactions, ...transferringTransactions]
      };
    }

    // Удаляем пустые категории
    Object.entries(newShopCategories).forEach(([category, data]) => {
      if (data.transactions.length === 0) {
        delete newShopCategories[category];
      }
    });

    Object.entries(newBudgetCategories).forEach(([category, data]) => {
      if (data.transactions.length === 0) {
        delete newBudgetCategories[category];
      }
    });

    // Применяем изменения к Redux store
    dispatch(setShopCategories(newShopCategories));
    dispatch(setBudgetCategories(newBudgetCategories));

    // Обновляем текущие данные
    if (selectedCategory === currentData.transactions[0]?.category) {
      setCurrentData(updatedSourceData);
    }

    // Сбрасываем выбранные транзакции и закрываем меню
    setSelectedTransactions({});
    setIsTransferMenuOpen(false);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: BudgetCategory = {
        name: newCategoryName.trim(),
        sourceCategories: [],
        isCustom: true
      };
      
      BUDGET_CATEGORIES.push(newCategory);
      dispatch(setBudgetCategories({
        ...budgetCategories,
        [newCategory.name]: { total: 0, totalCashback: 0, transactions: [] }
      }));
      
      setNewCategoryName('');
      setIsAddCategoryModalOpen(false);
    }
  };

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(currentConfig => {
      if (currentConfig.key === key) {
        return {
          key,
          direction: currentConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return {
        key,
        direction: 'asc'
      };
    });
  };

  const getSortedTransactions = (transactions: Transaction[]) => {
    if (!sortConfig.key || !sortConfig.direction) return transactions;

    return [...transactions].sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortConfig.key) {
        case 'amount':
          aValue = Math.abs(a.amount);
          bValue = Math.abs(b.amount);
          break;
        case 'date':
          // Преобразуем строку даты в объект Date
          const [aDatePart, aTimePart] = a.date.split(' ');
          const [aDay, aMonth, aYear] = aDatePart.split('.');
          const [aHours = '00', aMinutes = '00', aSeconds = '00'] = aTimePart ? aTimePart.split(':') : [];
          aValue = new Date(
            parseInt(aYear),
            parseInt(aMonth) - 1,
            parseInt(aDay),
            parseInt(aHours),
            parseInt(aMinutes),
            parseInt(aSeconds)
          );

          const [bDatePart, bTimePart] = b.date.split(' ');
          const [bDay, bMonth, bYear] = bDatePart.split('.');
          const [bHours = '00', bMinutes = '00', bSeconds = '00'] = bTimePart ? bTimePart.split(':') : [];
          bValue = new Date(
            parseInt(bYear),
            parseInt(bMonth) - 1,
            parseInt(bDay),
            parseInt(bHours),
            parseInt(bMinutes),
            parseInt(bSeconds)
          );
          break;
        case 'category':
          aValue = a.originalCategory;
          bValue = b.originalCategory;
          break;
        case 'description':
          aValue = a.description;
          bValue = b.description;
          break;
        case 'cardNumber':
          aValue = a.cardNumber;
          bValue = b.cardNumber;
          break;
        case 'status':
          aValue = a.amount > 0 ? 'Получено' : 'Отправлено';
          bValue = b.amount > 0 ? 'Получено' : 'Отправлено';
          break;
        default:
          return 0;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc' 
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      }

      return sortConfig.direction === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  };

  const renderCategoryButtons = () => {
    const allCategories = { ...shopCategories, ...budgetCategories };
    
    // Фильтруем категории, которые должны быть в "Нераспределенное"
    const filteredCategories = Object.entries(allCategories).filter(([category]) => 
      !UNALLOCATED_SOURCE_CATEGORIES.includes(category)
    );

    return (
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setIsAddCategoryModalOpen(true)}
          className="px-4 py-2 rounded-md text-sm bg-green-600 text-white hover:bg-green-700 transition-colors border-2 border-transparent hover:border-green-400"
        >
          + Добавить категорию
        </button>
        {filteredCategories.map(([category, data]) => {
          const amount = data.total;
          const formattedAmount = (amount < 0 ? '-' : '') + Math.abs(amount).toLocaleString('ru-RU', {
            style: 'currency',
            currency: 'RUB'
          });
          
          return (
            <button
              key={category}
              onClick={() => handleCategoryClick(category, data)}
              className={`px-4 py-2 rounded-md text-sm transition-colors flex items-center border-2 border-transparent
                ${selectedCategory === category
                  ? category === 'Нераспределенное'
                    ? 'bg-red-600 text-white border-red-400'
                    : category === 'Кэш'
                      ? 'bg-amber-500 text-white border-amber-400'
                      : category === 'Пополнения'
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-indigo-600 text-white border-indigo-400'
                  : category === 'Нераспределенное'
                    ? 'bg-red-700/30 text-gray-300 hover:bg-red-700/50 hover:border-red-400'
                    : category === 'Кэш'
                      ? 'bg-amber-700/30 text-gray-300 hover:bg-amber-700/50 hover:border-amber-400'
                      : category === 'Пополнения'
                        ? 'bg-emerald-700/30 text-gray-300 hover:bg-emerald-700/50 hover:border-emerald-400'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:border-indigo-400'
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

  const renderTransferMenu = () => {
    if (!isTransferMenuOpen) return null;

    const allCategories = { ...shopCategories, ...budgetCategories };
    const hasSelectedTransactions = Object.values(selectedTransactions).some(isSelected => isSelected);

    // Фильтруем категории, которые должны быть в "Нераспределенное"
    const availableCategories = Object.keys(allCategories)
      .filter(category => 
        !UNALLOCATED_SOURCE_CATEGORIES.includes(category) && 
        category !== selectedCategory
      );

    const menuContent = (
      <div className="fixed z-50" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        <div className="w-64 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5">
          <div className="py-1" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
            <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700 sticky top-0 bg-gray-800">
              Перенести в категорию:
            </div>
            {availableCategories.map(category => (
              <button
                key={category}
                onClick={() => handleTransferTransactions(category)}
                disabled={!hasSelectedTransactions}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  hasSelectedTransactions
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-500 cursor-not-allowed'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    );

    return createPortal(
      <>
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsTransferMenuOpen(false)}
        />
        {menuContent}
      </>,
      document.body
    );
  };

  const renderTransactionsTable = () => {
    if (!currentData) return null;

    const hasSelectedTransactions = Object.values(selectedTransactions).some(isSelected => isSelected);
    const allSelected = currentData.transactions.every((_, index) => selectedTransactions[index]);
    const sortedTransactions = getSortedTransactions(currentData.transactions);

    return (
      <>
        <div className="bg-gray-800 rounded-lg shadow overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-100">{selectedCategory}</h3>
                <p className="text-sm text-gray-400">Количество транзакций: {currentData.transactions.length}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-400">
                    {currentData.total.toLocaleString('ru-RU', {
                      style: 'currency',
                      currency: 'RUB',
                      signDisplay: 'always'
                    })}
                  </p>
                  {Object.values(selectedTransactions).some(isSelected => isSelected) && (
                    <p className="text-lg font-medium text-yellow-400">
                      Выбрано: {currentData.transactions
                        .filter((_, index) => selectedTransactions[index])
                        .reduce((sum, t) => sum + t.amount, 0)
                        .toLocaleString('ru-RU', {
                          style: 'currency',
                          currency: 'RUB',
                          signDisplay: 'always'
                        })}
                    </p>
                  )}
                  <p className="text-sm font-medium text-green-400">
                    Кэшбэк: {currentData.totalCashback.toLocaleString('ru-RU', {
                      style: 'currency',
                      currency: 'RUB'
                    })}
                  </p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setIsTransferMenuOpen(!isTransferMenuOpen)}
                    disabled={!hasSelectedTransactions}
                    className={`px-4 py-2 rounded-md text-sm ${
                      hasSelectedTransactions
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Перенести
                  </button>
                  {renderTransferMenu()}
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto relative">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-gray-900">
                    №
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 bg-gray-900">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-indigo-600 rounded border-gray-600"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-indigo-400 bg-gray-900"
                    onClick={() => handleSort('date')}
                  >
                    Дата
                    {sortConfig.key === 'date' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-indigo-400 bg-gray-900"
                    onClick={() => handleSort('amount')}
                  >
                    Сумма
                    {sortConfig.key === 'amount' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-indigo-400 bg-gray-900"
                    onClick={() => handleSort('category')}
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
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-indigo-400 bg-gray-900"
                        onClick={() => handleSort('description')}
                      >
                        Описание
                        {sortConfig.key === 'description' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-indigo-400 bg-gray-900"
                        onClick={() => handleSort('status')}
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
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-indigo-400 bg-gray-900"
                        onClick={() => handleSort('description')}
                      >
                        Описание
                        {sortConfig.key === 'description' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-indigo-400 bg-gray-900"
                        onClick={() => handleSort('cardNumber')}
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
                {sortedTransactions.map((transaction, index) => (
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
                        onChange={() => handleTransactionSelect(index)}
                        className="h-4 w-4 text-indigo-600 rounded border-gray-600"
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
        </div>
      </>
    );
  };

  const renderAddCategoryModal = () => {
    if (!isAddCategoryModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-96">
          <h3 className="text-xl font-semibold text-gray-100 mb-4">Добавить новую категорию</h3>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Название категории"
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:border-indigo-500"
          />
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={() => setIsAddCategoryModalOpen(false)}
              className="px-4 py-2 rounded-md text-sm bg-gray-700 text-gray-300 hover:bg-gray-600"
            >
              Отмена
            </button>
            <button
              onClick={handleAddCategory}
              className="px-4 py-2 rounded-md text-sm bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Добавить
            </button>
          </div>
        </div>
      </div>
    );
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processExcelFile(acceptedFiles[0]);
    }
  }, [processExcelFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    }
  });

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const handleClearAll = () => {
    dispatch(resetState());
    setSelectedCategory('');
    setCurrentData(null);
    setSelectedTransactions({});
    setIsTransferMenuOpen(false);
    setIsAddCategoryModalOpen(false);
    setSortConfig({ key: null, direction: null });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-lg font-semibold text-gray-100">Анализ расходов</div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleClearAll}
              className="px-4 py-2 rounded-md text-sm bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Очистить все
            </button>
            <span className="text-gray-300">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Выйти
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Выберите способ загрузки данных:</h2>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-100 mb-3">Загрузка из JSON</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadJson}
                  disabled={Object.keys(shopCategories).length === 0}
                  className={`px-4 py-2 rounded-md text-sm transition-colors ${
                    Object.keys(shopCategories).length > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Скачать JSON
                </button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleLoadJson}
                  ref={fileInputRef}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-md text-sm bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  Загрузить JSON
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-100 mb-3">Загрузка из Excel</h3>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed p-4 text-center rounded-lg ${
                  isDragActive ? 'border-indigo-500 bg-gray-700' : 'border-gray-600'
                }`}
              >
                <input {...getInputProps()} />
                <p className="text-sm text-gray-300">
                  {isDragActive
                    ? 'Отпустите файл здесь...'
                    : 'Перетащите Excel файл сюда или кликните для выбора'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {Object.keys(shopCategories).length > 0 && (
          <>
            {renderCategoryButtons()}
            {renderTransactionsTable()}
          </>
        )}
        {renderAddCategoryModal()}
      </div>
    </div>
  );
};

export default ExcelAnalyzer; 