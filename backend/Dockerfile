FROM node:14-alpine3.12 AS frontend-build

WORKDIR /frontend

COPY frontend/package.json .
COPY frontend/package-lock.json .

RUN npm install

COPY frontend/ .

RUN npm run build

FROM node:14-alpine3.12

WORKDIR /app

COPY backend/package.json .
COPY backend/package-lock.json .

RUN npm install

COPY backend/index.js .

COPY --from=frontend-build /frontend/build ./build
RUN mkdir -p /app/data
VOLUME ["/app/data"]

EXPOSE 4000

CMD ["node", "index.js"]
