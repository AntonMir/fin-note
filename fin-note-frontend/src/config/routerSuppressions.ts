/**
 * Файл для подавления предупреждений React Router
 * Эти предупреждения связаны с будущими изменениями в React Router v7
 */

// Перехватываем console.warn и фильтруем предупреждения React Router
const originalWarn = console.warn;
console.warn = function filterRouterWarnings(...args) {
  // Проверяем, содержит ли сообщение текст, относящийся к предупреждениям React Router
  const warningText = args[0] || '';
  const isRouterWarning = typeof warningText === 'string' && (
    warningText.includes('React Router Future Flag Warning') ||
    warningText.includes('v7_startTransition') ||
    warningText.includes('v7_relativeSplatPath')
  );

  // Если это предупреждение React Router, игнорируем его
  if (!isRouterWarning) {
    originalWarn.apply(console, args);
  }
};

export default {};