# Development Environment Instructions

This project is fully containerized for a consistent and easy-to-manage development experience using Docker and Docker Compose.

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (included with Docker Desktop for Mac and Windows)
- (Optional) AWS CLI configured if pulling images from ECR

---

## 1. Clone and Branch

1. **Clone the repository:**
```sh
git clone <repository-url>
cd <repository-directory>
```
2. Create a feature branch for your changes:
```sh
git checkout -b feature/awesome-endpoint
```

---

## 2. Build and Start Services Locally

There are two approaches: full local build or testing prebuilt images from ECR.

### Option A — Full local build
```sh
docker-compose up --build
```
This will:
- Build the Node.js application image locally.
- Pull required images for MySQL, Redis, and Elasticsearch.
- Start all services on a shared network.
- Optional: run in background with -d flag:
```sh
docker-compose up --build -d
```

### Option B — Pull prebuilt image from ECR (recommended for production parity)
```sh
docker pull <ECR_REGISTRY>/<ECR_REPOSITORY>:v1.2.0
docker run -p 3000:3000 <ECR_REGISTRY>/<ECR_REPOSITORY>:v1.2.0
```
This ensures your local testing matches the production deployment exactly.

---

## 3. Access the Service
- API is available at http://localhost:3000
- Health check: http://localhost:3000/ping

---

## 4. Running Tests Locally
- Run unit tests and fast feedback loop:
```sh
npm install
npm run test
```
- Use Docker Compose for integration tests when dependent services are required:
```sh
docker-compose up --build
```

---

## 5. Using Helper Scripts
The scripts/ directory contains scripts for interacting with the service and seeding test data.
- scripts/add_asset.sh — Adds sample crypto assets to the database.
- scripts/count.sh — Retrieves the total count of assets.
- scripts/get.sh — Retrieves a specific asset by ID.
- scripts/search.sh — Performs a search query.

---

## 6. Stopping Services
- Stop running containers:
```sh
docker-compose down
```
- Remove persistent volumes if needed:
```sh
docker-compose down -v
```

---

## 7. Developer Workflow Summary

1. Create a feature branch (feature/<short-desc>).
2. Implement changes locally, run unit tests (npm run test).
3. Use Docker Compose or prebuilt ECR images for integration testing.
4. Commit, push, and open a Pull Request targeting main.
5. PR checks run CI jobs (lint, tests, security scan). Merge only after approval.
6. Once merged, the Build pipeline creates production-ready Docker images; Deploy pipeline updates ECS/Fargate or EKS services.

---

