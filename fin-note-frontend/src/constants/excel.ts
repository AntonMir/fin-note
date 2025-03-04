export const CURRENCY_FORMAT_OPTIONS = {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0
} as const;

export const CURRENCY_FORMAT_OPTIONS_WITH_SIGN = {
  style: 'currency',
  currency: 'RUB',
  signDisplay: 'always'
} as const;

export const TABLE_COLUMNS = [
  { key: 'date', label: 'Дата' },
  { key: 'amount', label: 'Сумма' },
  { key: 'description', label: 'Описание' },
  { key: 'cardNumber', label: 'Карта' },
  { key: 'status', label: 'Статус' }
] as const;

export const EXCEL_FILE_TYPES = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls']
} as const;

export const STYLES = {
  positiveAmount: 'text-emerald-400',
  negativeAmount: 'text-white',
  cashback: 'text-amber-400',
  selected: 'text-indigo-400',
  text: 'text-gray-100',
  textMuted: 'text-gray-300',
  textDimmed: 'text-gray-400',
  background: 'bg-gray-800',
  backgroundDark: 'bg-gray-900',
  hover: 'hover:bg-gray-700',
  border: 'border-gray-700',
  button: {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    disabled: 'bg-gray-700 text-gray-500 cursor-not-allowed'
  }
} as const; 