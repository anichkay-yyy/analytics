FROM node:20-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

RUN mkdir -p /app/data

ENV DATA_DIR=/app/data

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && npm start"]
