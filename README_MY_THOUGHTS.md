# Architectural Thoughts & Improvement Plan

This document captures the initial brainstorming, detailed findings from a project review, and a comprehensive plan for improving the development and production environments.

---

## 1. Initial Brainstorming & Key Considerations

### On the Assignment Text

*   **"dev environment...macOS...production...Linux inside AWS"**: This points directly to **Docker containers** as the solution to ensure consistency across environments.
    *   *Improvement Area:* Optimize Docker images to reduce size by improving layering and using multi-stage builds.
*   **"stateless node.js process"**: This simplifies infrastructure. We don't need persistent storage for the application containers themselves (e.g., EBS volumes), which makes scaling easier.
*   **"API endpoints over HTTP"**: Requires a reverse proxy or load balancer.
    *   *Dev:* The `docker-compose` setup handles this sufficiently for local development.
    *   *Prod:* An AWS Application Load Balancer (ALB) is the ideal choice for Layer 7 routing, SSL termination, and health checks.
*   **"requires access to MySQL, Redis and ElasticSearch"**:
    *   *Dev:* Using official Docker images managed by `docker-compose` is perfect.
    *   *Prod:* To follow the **KISS principle** and ensure reliability, using AWS managed services (**RDS**, **ElastiCache**, **OpenSearch**) is the preferred approach over self-managing them on EC2 instances.
*   **"provide alternative approaches and the trade-offs"**:
    *   **Compute:** EC2 vs. Fargate vs. EKS. Fargate offers simplicity (serverless), while EKS provides more control and flexibility at the cost of increased complexity.
    *   **Databases:** Self-managed on EC2 (with saving plans for cost) vs. AWS Managed Services. Managed services have higher availability and lower operational overhead but can be more expensive.

### On the Project Implementation

*   **"repos; ECR?"**: Code should be stored in a Git repository (like GitHub). Docker images should be stored in a container registry; **Amazon ECR** is the natural choice for an AWS-based deployment.
*   **"versions of mysql/redis/elasticsearch"**: The current versions are outdated and pose significant challenges for a cloud migration.
    *   **MySQL 5.7** is past its End-of-Life (Oct 2023). It **must be upgraded** (e.g., to 8.0) to be used with AWS RDS.
    *   **Elasticsearch 7.17** is not available on Amazon OpenSearch Service due to licensing changes after version 7.10. A **migration to OpenSearch** is required, which may involve code changes.
*   **"owasp security principles?"**: Security is critical. We must follow best practices, such as **not running containers as the root user**.
*   **"github actions, gitlab runner, jenkins"**: The project already uses GitHub Actions, which is a good choice. Alternatives like GitLab CI or Jenkins could be considered for a dedicated, self-hosted tooling environment in the future.
*   **"node 16 is very outdated"**: Node.js 16 is approaching its end-of-life and should be upgraded to a recent Long-Term Support (LTS) version.
*   **Staging Environment**: A dedicated staging environment that mimics production is crucial for testing before deploying to production. This helps catch integration issues and bugs in a production-like setting without impacting real users.
