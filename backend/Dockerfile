FROM node:14-alpine3.12

WORKDIR /app

COPY backend/package.json .
COPY backend/package-lock.json .

RUN npm install

COPY backend/index.js .

EXPOSE 4000

CMD ["node", "index.js"]
