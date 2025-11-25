# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Копіюємо файли залежностей та конфігурації
COPY package*.json ./
COPY tsconfig*.json ./

# Встановлюємо ВСІ залежності
RUN npm ci

# Копіюємо вихідний код
COPY src ./src

# Збираємо проект через tsc (вже налаштовано в package.json)
RUN npm run build

# Production stage  
FROM node:20-alpine

WORKDIR /app

# Копіюємо package.json
COPY package*.json ./

# Встановлюємо тільки production залежності
RUN npm ci --omit=dev

# Копіюємо зібраний код
COPY --from=builder /app/dist ./dist

# Порт
EXPOSE 3000

# Запуск
CMD ["node", "dist/main.js"]
