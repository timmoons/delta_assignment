# Stage 1: Builder
FROM node:16-bullseye AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 8080
CMD [ "node", "dist/index.js" ]
