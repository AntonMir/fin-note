import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setCategories,
  loadStateFromJson,
  resetState
} from '../store/tableSlice';
import { RootState, loadState, saveState, restoreStateFromSession } from '../store/store';
import { CategoryData, SelectedTransactions, SortConfig } from '../types/excel';
import { EXCEL_FILE_TYPES, STYLES } from '../constants/excel';
import TransferMenu from '../components/excel/TransferMenu';
import AddCategoryModal from '../components/excel/AddCategoryModal';
import CategoryButtons from '../components/excel/CategoryButtons';
import TransactionsTable from '../components/excel/TransactionsTable';

const ExcelAnalyzer: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categories } = useSelector((state: RootState) => state.tables);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentData, setCurrentData] = useState<CategoryData | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<SelectedTransactions>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });
  const [isTransferMenuOpen, setIsTransferMenuOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);

  // Инициализация состояния при монтировании
  useEffect(() => {
    if (!user?.email) return;

    // Сначала пытаемся восстановить состояние из sessionStorage
    restoreStateFromSession(user.email);

    // Если в sessionStorage нет данных, загружаем из localStorage
    const state = loadState(user.email);
    if (state?.tables.categories && Object.keys(state.tables.categories).length > 0) {
      dispatch(loadStateFromJson(state.tables));
      const firstCategory = Object.keys(state.tables.categories)[0];
      if (firstCategory) {
        setSelectedCategory(firstCategory);
        setCurrentData(state.tables.categories[firstCategory]);
      }
    }

    // Сохраняем email текущего пользователя для автоматического сохранения
    localStorage.setItem('currentUser', user.email);

    // Очищаем email при размонтировании компонента
    return () => {
      localStorage.removeItem('currentUser');
    };
  }, [user?.email, dispatch]);

  // Сохранение состояния при изменениях
  useEffect(() => {
    if (user?.email) {
      saveState(user.email);
    }
  }, [categories, user?.email]);

  const handleDownloadJson = () => {
    const state = {
      categories,
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
    a.download = `Выписка от ${formattedDate}.json`;
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
        const category = row['Категория'] || 'Прочее';
        
        // Форматирование даты
        const operationDate = row['Дата операции'];
        const paymentDate = row['Дата платежа'];
        let dateToUse = '';
        
        try {
          if (operationDate) {
            const [day, month, year] = operationDate.split('.');
            if (day && month && year) {
              const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              if (!isNaN(date.getTime())) {
                dateToUse = `${day}.${month}.${year}`;
              }
            }
          }
          
          if (!dateToUse && paymentDate) {
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

        return {
          date: dateToUse,
          amount: parseFloat(row['Сумма операции'] || 0),
          description: row['Описание'] || '',
          category: category,
          mccCode: row['MCC'] || '',
          status: row['Статус'] || '',
          paymentType: row['Тип операции'] || '',
          cardNumber: row['Номер карты'] || '',
          cashback: parseFloat(row['Кэшбэк'] || 0)
        };
      });

      // Группировка транзакций по категориям
      const categoriesData = processedTransactions.reduce((acc: { [key: string]: CategoryData }, curr) => {
        if (!acc[curr.category]) {
          acc[curr.category] = { total: 0, totalCashback: 0, transactions: [] };
        }
        acc[curr.category].total += curr.amount;
        acc[curr.category].totalCashback += curr.cashback;
        acc[curr.category].transactions.push(curr);
        return acc;
      }, {});

      dispatch(setCategories(categoriesData));
      
      // Выбираем первую доступную категорию
      const firstCategory = Object.keys(categoriesData)[0];
      if (firstCategory) {
        setSelectedCategory(firstCategory);
        setCurrentData(categoriesData[firstCategory]);
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

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const handleReset = () => {
    dispatch(resetState());
    setSelectedCategory('');
    setCurrentData(null);
    setSelectedTransactions({});
    setSortConfig({ key: null, direction: null });
  };

  const handleTransfer = (targetCategory: string) => {
    if (!currentData || !selectedCategory) return;

    const selectedIndices = Object.entries(selectedTransactions)
      .filter(([_, isSelected]) => isSelected)
      .map(([index]) => parseInt(index));

    if (selectedIndices.length === 0) return;

    // Получаем выбранные транзакции
    const transferringTransactions = selectedIndices.map(index => currentData.transactions[index]);
    
    // Получаем оставшиеся транзакции
    const remainingTransactions = currentData.transactions.filter((_, index) => !selectedIndices.includes(index));

    // Обновляем исходную категорию
    const updatedSourceData = {
      total: remainingTransactions.reduce((sum, t) => sum + t.amount, 0),
      totalCashback: remainingTransactions.reduce((sum, t) => sum + t.cashback, 0),
      transactions: remainingTransactions
    };

    // Обновляем целевую категорию
    const targetData = categories[targetCategory] || { total: 0, totalCashback: 0, transactions: [] };
    const updatedTargetData = {
      total: targetData.total + transferringTransactions.reduce((sum, t) => sum + t.amount, 0),
      totalCashback: targetData.totalCashback + transferringTransactions.reduce((sum, t) => sum + t.cashback, 0),
      transactions: [...targetData.transactions, ...transferringTransactions]
    };

    // Создаем новый объект категорий
    const newCategories = { ...categories };
    
    // Если в исходной категории не осталось транзакций, удаляем её
    if (remainingTransactions.length === 0) {
      delete newCategories[selectedCategory];
      setSelectedCategory('');
      setCurrentData(null);
    } else {
      newCategories[selectedCategory] = updatedSourceData;
      setCurrentData(updatedSourceData);
    }
    
    newCategories[targetCategory] = updatedTargetData;

    // Обновляем состояние
    dispatch(setCategories(newCategories));
    setSelectedTransactions({});
    setIsTransferMenuOpen(false);
  };

  const handleAddCategory = (categoryName: string) => {
    const newCategories = { ...categories };
    newCategories[categoryName] = {
      total: 0,
      totalCashback: 0,
      transactions: []
    };
    dispatch(setCategories(newCategories));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processExcelFile(acceptedFiles[0]);
    }
  }, [processExcelFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: EXCEL_FILE_TYPES
  });

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${STYLES.text}`}>
            Анализ банковской выписки
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 transition-colors"
            >
              Сбросить
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className={`text-xl font-semibold ${STYLES.text} mb-4`}>Выберите способ загрузки данных:</h2>
          <div className="flex gap-4 mb-6">
            <div className={`flex-1 ${STYLES.background} p-6 rounded-lg`}>
              <h3 className={`text-lg font-medium ${STYLES.text} mb-3`}>Загрузка из JSON</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadJson}
                  disabled={Object.keys(categories).length === 0}
                  className={`px-4 py-2 rounded-md text-sm transition-colors ${
                    Object.keys(categories).length > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : STYLES.button.disabled
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
            <div className={`flex-1 ${STYLES.background} p-6 rounded-lg`}>
              <h3 className={`text-lg font-medium ${STYLES.text} mb-3`}>Загрузка из Excel</h3>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed p-4 text-center rounded-lg ${
                  isDragActive ? 'border-indigo-500 bg-gray-700' : 'border-gray-600'
                }`}
              >
                <input {...getInputProps()} />
                <p className={STYLES.textMuted}>
                  {isDragActive
                    ? 'Отпустите файл здесь...'
                    : 'Перетащите Excel файл сюда или кликните для выбора'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {Object.keys(categories).length > 0 && (
          <>
            <CategoryButtons
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryClick={handleCategoryClick}
              onAddCategoryClick={() => setIsAddCategoryModalOpen(true)}
            />
            {currentData && (
              <TransactionsTable
                currentData={currentData}
                selectedCategory={selectedCategory}
                selectedTransactions={selectedTransactions}
                onTransactionSelect={handleTransactionSelect}
                onSelectAll={handleSelectAll}
                onSort={handleSort}
                sortConfig={sortConfig}
                onTransferClick={() => setIsTransferMenuOpen(true)}
              />
            )}
            <TransferMenu
              isOpen={isTransferMenuOpen}
              onClose={() => setIsTransferMenuOpen(false)}
              selectedCategory={selectedCategory}
              categories={categories}
              onTransfer={handleTransfer}
              hasSelectedTransactions={Object.values(selectedTransactions).some(isSelected => isSelected)}
            />
            <AddCategoryModal
              isOpen={isAddCategoryModalOpen}
              onClose={() => setIsAddCategoryModalOpen(false)}
              onAdd={handleAddCategory}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ExcelAnalyzer; 