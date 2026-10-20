# Сборка: ставим все зависимости и компилируем TypeScript
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Рабочий образ: только продовые зависимости и собранный код
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist

# Сначала применяем миграции, потом запускаем приложение
CMD ["sh", "-c", "npm run migration:run:prod && exec node dist/main"]
