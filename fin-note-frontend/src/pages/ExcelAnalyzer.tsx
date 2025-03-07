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
import { BankType, TinkoffRow, SberbankRow } from '../types/banks';
import { processTinkoffRow, processSberbankRow, groupTransactionsByCategory } from '../utils/bankStatements';

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
  const [selectedBank, setSelectedBank] = useState<BankType>(() => {
    const savedBank = localStorage.getItem('selectedBank');
    return savedBank ? (savedBank as BankType) : BankType.TINKOFF;
  });

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

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        
        // Проверяем структуру загруженных данных
        if (!parsedData || typeof parsedData !== 'object' || !parsedData.categories) {
          throw new Error('Неверный формат JSON файла');
        }

        // Сбрасываем текущее состояние
        dispatch(resetState());
        setSelectedCategory('');
        setCurrentData(null);
        setSelectedTransactions({});
        setSortConfig({ key: null, direction: null });

        // Загружаем новые данные
        dispatch(loadStateFromJson({ categories: parsedData.categories }));

        // Выбираем первую доступную категорию
        const firstCategory = Object.keys(parsedData.categories)[0];
        if (firstCategory) {
          setSelectedCategory(firstCategory);
          setCurrentData(parsedData.categories[firstCategory]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке JSON:', error);
        alert('Ошибка при загрузке файла. Проверьте формат файла.');
      }
    };
    reader.readAsText(file);
  };

  const processExcelFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        dispatch(resetState());
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];

        if (jsonData.length > 0) {
          console.log('Первая строка данных:', jsonData[0]);
          console.log('Ключи первой строки:', Object.keys(jsonData[0]));
          console.log('Всего строк:', jsonData.length);

          const processedTransactions = jsonData.map((row) => {
            if (selectedBank === BankType.TINKOFF) {
              return processTinkoffRow(row as TinkoffRow);
            } else {
              return processSberbankRow(row as SberbankRow);
            }
          });

          const categorizedData = groupTransactionsByCategory(processedTransactions);
          dispatch(setCategories(categorizedData));

          // Выбираем первую доступную категорию
          const firstCategory = Object.keys(categorizedData)[0];
          if (firstCategory) {
            setSelectedCategory(firstCategory);
            setCurrentData(categorizedData[firstCategory]);
          }
        }
      } catch (error) {
        console.error('Ошибка при обработке файла:', error);
      }
    };
    reader.readAsBinaryString(file);
  }, [dispatch, selectedBank]);

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
      totalCashback: remainingTransactions.reduce((sum, t) => sum + (t.cashback || 0), 0),
      transactions: remainingTransactions
    };

    // Обновляем целевую категорию
    const targetData = categories[targetCategory] || { total: 0, totalCashback: 0, transactions: [] };
    const updatedTargetData = {
      total: targetData.total + transferringTransactions.reduce((sum, t) => sum + t.amount, 0),
      totalCashback: targetData.totalCashback + transferringTransactions.reduce((sum, t) => sum + (t.cashback || 0), 0),
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
      newCategories[selectedCategory] = updatedSourceData as CategoryData;
      setCurrentData(updatedSourceData as CategoryData);
    }
    
    newCategories[targetCategory] = updatedTargetData as CategoryData;

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

  const handleBankSelect = (bank: BankType) => {
    setSelectedBank(bank);
    localStorage.setItem('selectedBank', bank);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className={`text-2xl font-bold ${STYLES.text}`}>
              Анализ банковской выписки
            </h1>
            <p className={`mt-2 ${STYLES.textMuted}`}>
              Выбранный банк: {selectedBank === BankType.TINKOFF ? 'Тинькофф' : 'Сбербанк'}
            </p>
          </div>
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
          <h2 className={`text-xl font-semibold ${STYLES.text} mb-4`}>Выберите банк и способ загрузки данных:</h2>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => handleBankSelect(BankType.TINKOFF)}
              className={`px-6 py-3 rounded-lg text-white transition-colors ${
                selectedBank === BankType.TINKOFF
                  ? 'bg-indigo-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Тинькофф
            </button>
            <button
              onClick={() => handleBankSelect(BankType.SBERBANK)}
              className={`px-6 py-3 rounded-lg text-white transition-colors ${
                selectedBank === BankType.SBERBANK
                  ? 'bg-indigo-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Сбербанк
            </button>
          </div>

          <div className="flex gap-4">
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
              <h3 className={`text-lg font-medium ${STYLES.text} mb-3`}>
                Загрузка выписки {selectedBank === BankType.TINKOFF ? 'Тинькофф' : 'Сбербанк'}
              </h3>
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
                    : `Перетащите Excel файл выписки ${
                        selectedBank === BankType.TINKOFF ? 'Тинькофф' : 'Сбербанк'
                      } сюда или кликните для выбора`}
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