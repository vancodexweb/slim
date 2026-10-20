# Wellness Gift Shop: бэкенд

REST API магазина wellness-подарков: каталог с фильтрами, карточка подарка и оформление заказа.

**Стек:** NestJS 11, TypeScript, PostgreSQL 16, TypeORM, `@nestjs/config`, class-validator и class-transformer, Swagger, Docker Compose.

## Быстрый старт (Docker)

Нужны только Docker и Docker Compose.

```bash
cp .env.example .env        # на Windows: copy .env.example .env
docker compose up --build
```

Compose поднимает PostgreSQL и приложение. Миграции применяются автоматически при старте приложения.

Чтобы заполнить каталог тестовыми данными, в соседнем терминале:

```bash
docker compose exec app npm run seed:prod
```

Дальше:

- API: <http://localhost:3000>
- Swagger: <http://localhost:3000/docs>

Порт берётся из `PORT` в `.env`.

## Локальный запуск без Docker для приложения

Нужен Node.js 22+. База поднимается в Docker, приложение запускается на своей машине.

```bash
cp .env.example .env
docker compose up -d db     # только база данных
npm install
npm run migration:run       # создать таблицы
npm run seed                # тестовые данные
npm run start:dev           # запуск с автоперезагрузкой
```

## Переменные окружения

Шаблон лежит в `.env.example`.

| Переменная     | Назначение                                                                  |
| -------------- | --------------------------------------------------------------------------- |
| `PORT`         | порт приложения                                                             |
| `FRONTEND_URL` | адрес фронтенда, разрешённый в CORS                                         |
| `DB_HOST`      | хост PostgreSQL (в Docker Compose подменяется на `db`)                      |
| `DB_PORT`      | порт PostgreSQL (в Docker Compose подменяется на `5432`)                    |
| `DB_USER`      | пользователь PostgreSQL                                                     |
| `DB_PASS`      | пароль PostgreSQL                                                           |
| `DB_NAME`      | имя базы данных                                                             |

## Миграции

Схема меняется только миграциями (`synchronize` выключен).

```bash
npm run migration:run                                         # применить
npm run migration:generate -- src/database/migrations/name    # сгенерировать из изменений в сущностях
npm run migration:revert                                      # откатить последнюю
npm run migration:show                                        # статус
```

## Seed

`npm run seed` создаёт 18 подарков (6 категорий, 3 уровня) и 5 заказов с позициями.
Повторный запуск не дублирует данные: id записей генерируются из их названия (стабильный UUID), поэтому те же записи просто обновляются.

Категории: `spa`, `aromatherapy`, `tea`, `skincare`, `yoga`, `sleep`.
Уровни (`tier`): `basic`, `premium`, `luxury`.

## API

Подробная схема и пробный запуск запросов есть в Swagger: `/docs`.

### `GET /gifts`

Необязательные query-параметры, все комбинируются через AND:

| Параметр   | Описание                                                          |
| ---------- | ----------------------------------------------------------------- |
| `search`   | подстрока в `title` или `description`, без учёта регистра         |
| `category` | категория (без учёта регистра)                                    |
| `tier`     | `basic`, `premium` или `luxury`                                   |
| `minPrice` | минимальная цена, число не меньше 0                               |
| `maxPrice` | максимальная цена, число не меньше 0, не меньше `minPrice`        |

```bash
curl "http://localhost:3000/gifts?category=spa&tier=premium&maxPrice=6000"
```

```json
{
  "items": [{ "id": "…", "title": "Сертификат на массаж", "category": "spa", "price": 5500, "tier": "premium", "rating": 4.8, "imageUrl": "…", "description": "…" }],
  "suggestions": []
}
```

Если ничего не найдено, `items` пустой, а в `suggestions` приходят три подарка с лучшим рейтингом.

### `GET /gifts/:id`

Ответ: `{ "gift": Gift, "similar": Gift[] }`. В `similar` до 4 подарков той же категории, без самого подарка. Если подарка нет, ответ 404. Если `id` не похож на UUID, ответ 400.

### `POST /orders`

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Иван",
    "customerEmail": "ivan@example.com",
    "recipient": "Мама",
    "comment": "Подарок на день рождения",
    "items": [
      { "giftId": "fe233c0a-b813-5060-8398-a04e2c36b96b", "quantity": 1 },
      { "giftId": "87c11988-f87a-5e64-b81f-f19c56d6eb2a", "quantity": 2 }
    ]
  }'
```

Ответ 201: заказ с позициями (`items`, в каждой есть `gift`, `price` на момент заказа и `quantity`).

- Цены берутся из базы, цены из запроса игнорируются.
- `totalAmount` считает сервер.
- Заказ и позиции сохраняются в одной транзакции: при ошибке в базе не остаётся ничего.

### `GET /orders`

Список заказов с позициями, новые сверху.

### Формат ошибок валидации

```json
{
  "message": "Ошибка валидации",
  "errors": [{ "field": "items.0.quantity", "messages": ["Количество должно быть не меньше 1"] }],
  "statusCode": 400
}
```

Для вложенных полей `field` — это путь (`items.0.quantity`).

## Допущения и принятые решения

- **`tier`** — строка в базе, в коде и валидации это enum `basic | premium | luxury`.
- **`category`** — свободная строка, в seed используются короткие латинские названия (`spa`, `tea` и т. д.), чтобы их удобно передавать в query.
- **Формат ответов** `GET /gifts` и `GET /gifts/:id` — объекты `{ items, suggestions }` и `{ gift, similar }`.
- **`suggestions`** — три подарка с лучшим рейтингом, при равном рейтинге по названию.
- **Дубли `giftId` в заказе объединяются:** количества суммируются в одну позицию. Отклонять такой заказ незачем: пользователь мог добавить один подарок дважды.
- **Несуществующий `giftId`** даёт 404 со списком не найденных id, в базу ничего не пишется.
- **Количество одного подарка** — целое от 1 до 100. Верхняя граница защищает от случайных гигантских заказов.
- **Деньги** хранятся как `numeric(10,2)`, сумма заказа считается в копейках, чтобы не копить ошибки округления.
- **Запросы к базе** только через `find`, `findOneBy`, `save`, `findAndCount`, транзакция через `DataSource.transaction`.
- **Авторизации нет:** в задании её нет, все эндпоинты открыты. Предыдущая версия проекта с авторизацией осталась в истории git.

## Тесты

```bash
npm test
```

Юнит-тесты сервисов: сумма заказа и объединение дублей, откат при несуществующем подарке, suggestions и логика фильтров каталога. База для них не нужна.

Заглушка `test/typeorm.shim.ts` подменяет `@nestjs/typeorm` в тестах: пакет — чистый ESM, а jest 30 грузит такие пакеты только на Node 24.9+.

## CI/CD (GitLab)

Пайплайн описан в `.gitlab-ci.yml`:

1. **build:** собирает стадию `build` из `Dockerfile` (установка зависимостей и компиляция).
2. **test:** `lint` и `unit-tests` запускаются внутри этого образа.
3. **deploy:** из основной ветки, `docker compose -p wellness-shop up -d --build`.

GitLab Runner стоит на том же сервере, где живёт приложение, поэтому джобы выполняются прямо там и SSH-ключи не нужны.
Node.js на сервере тоже не нужен, всё идёт через Docker.

Что нужно один раз настроить:

1. На сервере должны быть Docker и плагин `docker compose` (`docker compose version`).
2. Пользователь раннера должен работать с Docker: `sudo usermod -aG docker gitlab-runner`, затем `sudo systemctl restart gitlab-runner`.
3. В GitLab (Settings → CI/CD → Variables) создай переменную `ENV_FILE` типа **File** с содержимым боевого `.env` (по образцу `.env.example`). Свободный `PORT` и, если 5432 занят, свой `DB_HOST_PORT`.
4. Добавь раннеру тег `shop-deploy` (Settings → CI/CD → Runners → Edit → Tags): все джобы в `.gitlab-ci.yml` выполняются только на раннере с этим тегом. Галочку «Run untagged jobs» можно снять, а общие раннеры GitLab для проекта лучше выключить.

После первого деплоя заполни каталог: `docker compose -p wellness-shop exec app npm run seed:prod`.

База публикуется только на `127.0.0.1` сервера. Данные хранятся в Docker-томе и переживают повторные деплои.

## Структура

```
src/
├── common/            # трансформер numeric, Trim, валидаторы, формат ошибок
├── database/          # data-source, миграции, seed
├── gifts/             # каталог: сущность, DTO, сервис, контроллер
├── orders/            # заказы: сущности, DTO, сервис, контроллер
├── app.module.ts
└── main.ts            # ValidationPipe, CORS, Swagger
test/typeorm.shim.ts   # заглушка для юнит-тестов
```
