# Production Environment Architecture (AWS)

This document outlines the architectural plan for deploying the service to a production environment on Amazon Web Services (AWS). The design prioritizes scalability, security, observability, and operational efficiency by leveraging AWS managed services.

## 1. Core Infrastructure

### Compute: AWS Fargate

- **Service:** The containerized Node.js application will be deployed using **AWS Fargate** with the `aws-vpc` network mode.
- **Rationale:** Fargate is a serverless compute engine for containers that eliminates the need to manage the underlying EC2 instances. This significantly reduces operational overhead related to patching, scaling, and securing servers.
- **Scalability:** The Fargate service will be configured with auto-scaling policies based on CPU and memory utilization to handle variable traffic loads.

### Databases & Caching: AWS Managed Services

- **MySQL:** **Amazon RDS for MySQL** will be used as the relational database. It will be deployed in a Multi-AZ configuration to ensure high availability and automatic failover.
- **Redis:** **Amazon ElastiCache for Redis** will provide a managed in-memory caching layer.
- **Elasticsearch:** **Amazon OpenSearch Service** will be used for search capabilities.
- **Rationale:** Using AWS managed services for stateful components is a best practice. AWS handles backups, patching, replication, and failover, which is complex and time-consuming to manage manually.

## 2. Networking & Security

### Network Isolation: Amazon VPC

- All resources will be deployed within a custom **Virtual Private Cloud (VPC)**.
- The VPC will be segmented into **public subnets** (for resources that need direct internet access) and **private subnets** (for the application and databases).

### Load Balancing: Application Load Balancer (ALB)

- An internet-facing **Application Load Balancer (ALB)** will be placed in the public subnets.
- The ALB will serve as the single entry point for all inbound HTTP/S traffic, terminate SSL/TLS, and distribute requests to the Fargate tasks running in the private subnets.

### Security Groups

- **ALB Security Group:** Allows inbound traffic on port 443 (HTTPS) from `0.0.0.0/0` (the internet).
- **Fargate Service Security Group:** Allows inbound traffic on the application port (3000) exclusively from the ALB's security group.
- **Database Security Groups:** Each database (RDS, ElastiCache, OpenSearch) will have its own security group that allows inbound traffic on its respective port exclusively from the Fargate service's security group. This multi-layered approach ensures the databases are completely isolated from the public internet.

### Secrets Management

- **AWS Secrets Manager** will be used to securely store and manage database credentials and other sensitive configuration values.
- The Fargate task definition will be configured with the necessary IAM permissions to fetch these secrets at runtime and inject them into the container as environment variables. This avoids hardcoding secrets in the application code or Docker image.

## 3. Observability

- **Logging:** The Fargate service will be configured to stream all application logs (`stdout`/`stderr`) to **Amazon CloudWatch Logs** for centralized logging and analysis.
- **Metrics:** **Amazon CloudWatch Metrics** will be used to monitor the performance of all resources (Fargate, ALB, RDS, etc.).
- **Alarms:** **CloudWatch Alarms** will be configured to trigger on key performance indicators (e.g., high Fargate CPU, ALB 5xx error rate). These alarms will send notifications to the engineering team via **Amazon SNS** / **Slack**.


