# Deployment Flow

This document describes the CI/CD (Continuous Integration/Continuous Deployment) pipeline for deploying the service to the AWS production environment. The pipeline is automated using **GitHub Actions**.

## 1. Branching Strategy & Trigger

The deployment process is triggered by merges to the `main` branch, following a standard Pull Request (PR) workflow.

1.  **Feature Branches:** All development is done on separate branches (e.g., `feature/add-new-endpoint`).
2.  **Pull Requests (PRs):** When a feature is ready, a PR is opened to merge the feature branch into `main`.
3.  **Automated Checks & Review:** The PR is a quality gate. It is configured to require:
    - A code review from at least one other team member.
    - Successful completion of the CI pipeline (build and test stages).
4.  **Merge to `main`:** Merging a PR into the `main` branch is considered a release and automatically triggers the full deployment pipeline to production.

## 2. CI/CD Pipeline (GitHub Actions)

The pipeline is defined in a workflow file located at `.github/workflows/deploy.yml`. It consists of the following sequential jobs:

### Job 1: Build & Test

This job runs on every push to `main` and on every PR.

- **Trigger:** `on: [push: { branches: [main] }, pull_request: { branches: [main] }]`
- **Steps:**
    1.  **Checkout Code:** Checks out the repository's source code.
    2.  **Setup Node.js:** Sets up the correct Node.js version.
    3.  **Install Dependencies:** Runs `npm install`.
    4.  **Build:** Compiles TypeScript to JavaScript using `npm run build`.
    5.  **Test:** Executes the automated test suite with `npm test`. If this step fails, the pipeline stops.

### Job 2: Build, Push, and Deploy

This job runs only after the "Build & Test" job succeeds on a push to the `main` branch.

- **Trigger:** `on: [push: { branches: [main] }]`
- **Needs:** `needs: build-and-test`
- **Permissions:** Requires AWS credentials to be configured as secrets in the GitHub repository (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).
- **Steps:**
    1.  **Configure AWS Credentials:** Logs into AWS using the stored secrets.
    2.  **Login to Amazon ECR:** Authenticates the Docker client with the Amazon Elastic Container Registry.
    3.  **Build and Push Docker Image:**
        - Builds the Docker image using the project's `Dockerfile`.
        - Tags the image with the Git commit SHA for traceability (e.g., `my-ecr-repo:1a2b3c4d`).
        - Pushes the tagged image to Amazon ECR.
    4.  **Deploy to Amazon ECS:**
        - Downloads the current task definition for the Amazon ECS (Fargate) service.
        - Creates a new version of the task definition, updating the image field to point to the newly pushed Docker image from the previous step.
        - Updates the ECS service to use this new task definition, which triggers a rolling, zero-downtime deployment.

---
This automated flow ensures that every change deployed to production is automatically built, tested, and versioned, minimizing the risk of manual error and increasing deployment velocity.
