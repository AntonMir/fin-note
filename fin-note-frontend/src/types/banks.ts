export enum BankType {
  TINKOFF = 'TINKOFF',
  SBERBANK = 'SBERBANK'
}

export interface Transaction {
  date: string;
  amount: number;
  description: string;
  category: string;
  mccCode?: string;
  status?: string;
  paymentType: string;
  cardNumber?: string;
  cashback?: number;
  isExpense?: boolean;
}

export interface CategoryData {
  total: number;
  totalCashback: number;
  transactions: Transaction[];
}

export interface Categories {
  [key: string]: CategoryData;
}

export interface TinkoffRow {
  'Дата операции': string;
  'Дата платежа': string;
  'Номер карты': string;
  'Статус': string;
  'Сумма операции': number;
  'Валюта операции': string;
  'Категория': string;
  'MCC': string;
  'Описание': string;
  'Бонусы': number;
}

export interface SberbankRow {
  'Номер': string;
  'Дата': string;
  'Тип операции': string;
  'Категория': string;
  'Сумма': number;
  'Валюта': string;
  'Описание': string;
  'Состояние': string;
  'Номер счета/карты списания': string;
} 