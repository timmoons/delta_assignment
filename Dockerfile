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

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy production dependencies and install them
COPY --chown=appuser:appgroup package*.json ./
RUN npm install --only=production

# Copy built application code from the builder stage
COPY --chown=appuser:appgroup --from=builder /usr/src/app/dist ./dist

# Switch to the non-root user
USER appuser

EXPOSE 3000
CMD [ "node", "dist/index.js" ]
