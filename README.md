# Fin-Note

Проект для управления личными финансами

---

<table>
  <tr style="width:50vw">
    <td>
        <p>Структура проекта</p>
    </td>
    <td>
        <p>* fin-note-frontend (React приложение)</p>
        <p>* fin-note-backend (NestJS сервер)</p>
    </td>
  </tr>
  <tr>
     <td>
        <p>Технологии</p>
    </td>
    <td>
        <p>Frontend:</p>
        <p>* React</p>
        <p>* TypeScript</p>
        <p>* Material-UI</p>
        <br/>
        <p>Backend:</p>
        <p>* Node.js v22.14.0</p>
        <p>* TypeScript v5.1.3</p>
        <p>* NestJS v10.0.0</p>
    </td>
  </tr>
</table>

---

## Описание проекта

Fin-Note - это веб-приложение для управления личными финансами, которое позволяет пользователям:
- Отслеживать доходы и расходы
- Создавать финансовые цели
- Анализировать финансовые потоки
- Планировать бюджет

## Начало работы

### Предварительные требования

- Node.js (v22.14.0 или выше)
- npm или yarn
- Docker и Docker Compose (для запуска в контейнерах)

### Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone [url-репозитория]
```

2. Установите зависимости для обоих проектов:
```bash
# Для фронтенда
cd fin-note-frontend
npm install

# Для бэкенда
cd fin-note-backend
npm install
```

3. Создайте и настройте файлы окружения:
```bash
# В директории fin-note-backend
cp .env.example .env
```

4. Запуск через Docker:
```bash
docker-compose up
```

Или запуск локально:
```bash
# Запуск фронтенда (в директории fin-note-frontend)
npm start

# Запуск бэкенда (в директории fin-note-backend)
npm run start:dev
```

## Документация

Подробная документация доступна в README.md файлах соответствующих директорий:
- [Frontend документация](./fin-note-frontend/README.md)
- [Backend документация](./fin-note-backend/README.md) 