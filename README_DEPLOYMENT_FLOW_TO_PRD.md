# Deployment Flow to Production (CI/Build/Deploy)

This document explains how code moves from development to production, focusing on **workflow, pipelines, versioning, and deployment processes**. Infrastructure specifics are handled in `production_plan.md`.

---

## 1. Development → Production: Branching & PR Flow

* **Branching:** Use feature or bugfix branches:
  - `feature/<short-desc>`
  - `bugfix/<short-desc>`
* **Pull Requests (PRs):**  
  - Target `main` branch.
  - PR checks required before merge:
    - `ci.yml` job: build, lint, unit tests, coverage, security scan.
    - At least 1 approving review from another engineer.
* Merge to `main` triggers the **Build pipeline**.

---

## 2. Versioning & Image Tagging

* Adopt **Semantic Versioning**: `vMAJOR.MINOR.PATCH` (e.g., `v1.2.0`).
* Each Docker image is tagged twice:
  - `vMAJOR.MINOR.PATCH` — human-friendly, used for releases and rollbacks.
  - `sha-<commit>` — immutable, unique per commit.
* Rollback strategy: redeploy an older `vMAJOR.MINOR.PATCH` tag.
* Avoid `latest` in production; only use specific tags for reproducibility.

---

## 3. CI/CD Pipelines

### Continuous Integration (`ci.yml`)
* **Trigger:** Runs on PRs and pushes to feature branches.
* **Jobs:** build, lint, test (with coverage), security scan.
* **Purpose:** Ensure code quality **before merge**.

### Build Pipeline (`build.yml`)
* **Trigger:** On merge to `main`.
* **Steps:**
  1. Build Docker image.
  2. Tag image with semantic version (`vMAJOR.MINOR.PATCH`) and commit SHA (`sha-<commit>`).
  3. Push image to ECR.
* **Outcome:** Immutable image available for testing or deployment.

* **Local testing:** Developers can pull the same image to replicate production:
```bash
docker pull <ECR_REGISTRY>/<ECR_REPOSITORY>:v1.2.0
docker run -p 3000:3000 <ECR_REGISTRY>/<ECR_REPOSITORY>:v1.2.0
```

### Deploy Pipeline (deploy.yml)

* **Trigger:** Manual (workflow_dispatch), requires version input.
* **Steps:**
  1. Pull prebuilt image from ECR.
  2. Update ECS service (or Kubernetes deployment) with rolling update.
  3. Monitor health and service stability.
* **Rollback:** Re-deploy previous semantic version tag.

---

## 4. Responsibilities

| Pipeline | Trigger           | Action                           |
| -------- | ----------------- | -------------------------------- |
| CI       | PR / push to main | Lint, test, scan                 |
| Build    | Push to main      | Build & push Docker image to ECR |
| Deploy   | Manual            | Deploy prebuilt image to ECS     |

- CI ensures quality.
- Build produces artifacts.
- Deploy guarantees deterministic, safe releases.

---
