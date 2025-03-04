import { BudgetCategory } from '../types/transaction';

export const CATEGORY_MAPPING: { [key: string]: string } = {
  'Супермаркеты': 'Продукты',
  'Фастфуд': 'Продукты',
  'Рестораны': 'Продукты',
  
  'Такси': 'Проезд',
  'Каршеринг': 'Проезд',
  'Местный транспорт': 'Проезд',
  'Аренда авто': 'Проезд',
  'Топливо': 'Проезд',
  'Автоуслуги': 'Проезд',
  
  'Бонусы': 'Кэш',
  'Услуги банка': 'Кэш',
};

export const UNALLOCATED_SOURCE_CATEGORIES = [
  'Маркетплейсы',
  'Медицина',
  'Одежда и обувь',
  'Цифровые товары',
  'Различные товары',
  'Экосистема Яндекс',
  'Детские товары',
  'Дом и ремонт'
];

export const BUDGET_CATEGORIES: BudgetCategory[] = [
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