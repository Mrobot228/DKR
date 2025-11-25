# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Копіюємо файли залежностей
COPY package*.json ./

# Встановлюємо ВСІ залежності (включаючи dev для збірки)
RUN npm ci

# Копіюємо вихідний код
COPY . .

# Збираємо проект через npx
RUN npx nest build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Копіюємо package.json
COPY package*.json ./

# Встановлюємо тільки production залежності
RUN npm ci --omit=dev

# Копіюємо зібраний код
COPY --from=builder /app/dist ./dist

# Порт (Railway автоматично встановлює PORT)
EXPOSE 3000

# Запуск
CMD ["node", "dist/main.js"]
