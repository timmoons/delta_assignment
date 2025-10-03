# Production Environment Architecture (AWS)

This document outlines the architectural plan for deploying the service to a production environment on Amazon Web Services (AWS). The design prioritizes scalability, security, observability, and operational efficiency by leveraging AWS managed services.

## 1. Core Infrastructure

### A: Compute: AWS Fargate

- **Service:** The containerized Node.js application will be deployed using **AWS Fargate** with the `aws-vpc` network mode (i.e. each task gets its own ENI). Demonstration can be given with own website (and its AWS account).
- **Rationale for first choice:** KISS. Fargate is a serverless compute engine for containers that eliminates the need to manage the underlying EC2 instances. This significantly reduces operational overhead related to patching, scaling, and securing servers.
- **Scalability:** The Fargate service will be configured with auto-scaling policies based on CPU and memory utilization to handle variable traffic loads.
    -   Configure Service Auto Scaling based on CPU, memory, custom metrics, or request count.
    -   Run tasks across multiple Availability Zones (AZs) to tolerate AZ-level failures.
    -   Use health checks from the ALB to route around unhealthy tasks.

### B: Alternatives: ECS on EC2 with ASG + Savings Plans
Instead of using Fargate, the ECS service can be deployed using the EC2 launch type for better cost control, especially when combined with EC2 Savings Plans and reserved instance capacity. Example of this setup can be demonstrated for https://danya.be .

- **Service:** Deploy ECS cluster backed by EC2 Auto Scaling Groups (ASGs). EC2 instances run the ECS agent (with the task definition for the containerized Node.js application) and are managed by ECS Capacity Providers. These will help placing the task on an available EC2 instance based on capacity. ASG can have auto scaling configured based on cluster CU/memory reservations. 
- **Advantage:** This approach offers more control over compute capacity, allows for daemon processes (e.g., logging sidecars, monitoring agents).
- **Disadvantage:** Added operational overhead: patching AMIs, maintaining EC2 health, and scaling policies.

### C: Alternative: Kubernetes (EKS) Deployment for the containered Node.js application
If EKS is already provisioned, the Node.js service can be deployed as a Kubernetes Deployment
- **Service:** Use an (existing) EKS-managed node group (EC2-based) or Fargate profiles. Add the k8s deployment/service/HPA
- **Advantage:** Leverage Kubernetes-native patterns and tools (Kustomize or Helm if there would ever be multiple environments in the cloud). Fast to add the solution in an existing k8s cluster.
- **Disadvantage:** Operational overhead comes in maintaining the cluster. 

### Databases & Caching

## A:  AWS Managed Services
- **MySQL:** **Amazon RDS for MySQL** will be used as the relational database. It will be deployed in a Multi-AZ configuration for automatic failover. Read replicas can be setup for heavy read loads. AWS Backups can be used for automatic backups and point in time recovery.
- **Redis:** **Amazon ElastiCache for Redis** will provide a managed in-memory caching layer. Redis should be in replication mode (primary + replicas) for automatic failover accross multiple AZs. 
- **Elasticsearch:** **Amazon OpenSearch Service** will be used for search capabilities.
- **Rationale for first choice:** KISS/ Using AWS managed services for stateful components is a best practice. AWS handles backups, patching, replication, and failover, which is complex and time-consuming to manage manually.


## B: Alternative: EC2-based Hosting with self maintained services. 
As an alternative to AWS-managed databases (RDS, ElastiCache, OpenSearch), you can host the DB and stateful services directly on EC2 instances with Docker installed. This offers version control and custom configuratoin but increases operational burden. You will need to manage the services yourself. 
Note: Combining with AWS managed services is possible.
- **MySQL:** Run MySQL on a properly sized EC2 instance with MySQL installed (from marketplace, or EC2 instance with docker and mysql image, or DIY install on clean AMI). Configure EBS snapshots for backups, and monitor logs locally or via CloudWatch agent.
- **Redis:** Run Redis in Docker with persistence. Perhaps Redis Sentinel for HA.
- **OpenSearch:** Run OpenSearch (or Elasticsearch OSS) in a Dockerized cluster.
- **Disadvantage:** These options require manual effort for: Backups and restore validation, patch management and upgrades, security hardening (firewalls, encryption, IAM roles, etc.), monitoring, alerting, and performance tuning
- **Advantage/Use case:** The project was using outdated versions that were not all directly compatible with managed services (unless upgraded first). So mentioning this approach in case:
a) You require custom configuration or unsupported versions in managed services
b) You need to run extremely big instances of managed services, that cost more than the time it would take to manually manage the service yourself. Cost control is a top priority, so you're willing to trade it for management effort.


---

## 2. Networking & Security

### A: Network Isolation: Amazon VPC

- All resources will be deployed within a custom **Virtual Private Cloud (VPC)**.
- The VPC will be segmented into **public subnets** (for resources that need direct internet access) and **private subnets** (for the application and databases).
- Public subnet will have ALB, NAT Gateway, ..
- ALB for OSI layer 7 application load balancing
- NAT Gateway (in public subnet) for outbound internet access from private resources (in case the application needs outbound access at some point).
- Can use interface VPC Endpoints (for ECS tasks / RDS / Opensearch in the private VPC net) so traffic doesn't leave the private network (doesn't traverse public internet) for services like Secret manager, S3, Cloudwatch, ..

### B: Load Balancing: Application Load Balancer (ALB)

- An internet-facing **Application Load Balancer (ALB)** will be placed in the public subnets.
- The ALB will serve as the single entry point for all inbound HTTPS traffic, terminate SSL/TLS, and distribute requests to the ECS Fargate service targets running in the private subnets.
- Can use this ALB for: target groups, path‑based routing, host‑based routing, sticky sessions (if needed), and health checks.
- Need to setup security groups for ALB, to allow inbound TLS/HTTPS traffic, and outbound for the application (/ECS task).
- Can use AWS Certificate Manager (ACM) to manage TLS/HTTPS certificates.

### C: Security Groups

- **ALB Security Group:** Allows inbound traffic on port 443 (HTTPS) from `0.0.0.0/0` (the internet), redirect port 80 (HTTP) to port 443.
- **Fargate Service Security Group:** Allows inbound traffic on the application port (3000) exclusively from the ALB's security group. 
- **Database/stateful resources Security Groups:** Each stateful resource (RDS, ElastiCache, OpenSearch) will have its own security group that allows inbound traffic on its respective port exclusively from the Fargate service's security group (/ ECS task's SG). This multi-layered approach ensures the stateful resources are completely isolated from the public internet, and only accessible from the application in the ECS Task or Kubernetes pods (EKS). 
- **Network ACLs:** Access control list can be added to control incoming and outgoing traffic at the subnet level for additional security layer to control which traffic enters or leave the VPC.

### D: Secrets Management

- **AWS Secrets Manager** will be used to securely store and manage database credentials and other sensitive configuration values like API keys.
- The ECS task definition will be configured with the necessary IAM permissions to fetch these secrets at runtime and inject them into the container as environment variables. Or (not implemented in this PoC) the application will fetch the secrets at runtime using the AWS SDK. This avoids hardcoding secrets in the application code or Docker image. 
- **Alternatives:** AWS SSM Parameter Store is cheaper with less features, as Secrets manager is billed per secret + per API call. Another alternative is Vault if a more dynamic secret management tool is required, and secrets sets change often. 

---

## 3. Observability

- **Logging:** The Fargate service will be configured to stream all application logs (`stdout`/`stderr`) to **Amazon CloudWatch** logs for centralized logging and analysis. Log groups should have naming conventions and retention policies defined.
- **Metrics:** Amazon CloudWatch Metrics will be used to monitor the performance of all resources (Fargate, ALB, RDS, etc.). Using metrics of CPU, memory, disk, network to create observability in the infrastructure.
- **Distributed Tracing & APM:** Integrate AWS X-Ray, OpenTelemetry, or a third‑party APM (like Datadog) to trace requests across microservices. Useful for correlating latency issues, or flow of a request.
- **Alarms:** CloudWatch Alarms will be configured to trigger on key performance indicators (e.g., high container CPU, ALB 5xx error rate, unhealthy hosts in ASG). These alarms will send notifications to the engineering team via **Amazon SNS** / **Slack**.
- **Capacity Planning & Limits:**
  • Monitor and plan for resource limits (e.g. VPC ENIs, subnet IP exhaustion, open file handles).
  • Use Service Quotas, and request increases ahead of time / upgrade to other instances types.
- **Alternative:** Datadog or Grafana/Kibana over those logs/metrics for health dashboard, SLO tracking, error budgets, etc.

---

## 4. Security

- **IAM:** Configure users and groups with least privileges principle. If the application only needs to retrieve secrets from a certain ARN, it should be limited to this.
- **Firewall:** Use AWS WAF or Shield for DDoS / web request protection. If under heavy attacks often, consider using cloudflare as a service (and then also use this for your caching).
- **Audit logging & Security Logging:** Log and audit all accesses via CloudTrail / Secrets Manager logging
  • Enable AWS CloudTrail to log all API activity in the account.
  • Enable VPC Flow Logs to capture network traffic (if needed) for diagnostic or security investigations.
  • Capture RDS / OpenSearch audit logs, slow query logs, error logs etc.
- **Additional tools and guardrails:** 
  • If additional security is warranted; Enable AWS Config, GuardDuty, Security Hub, IAM Access Analyzer.
  • Use KMS Customer-Managed Keys (CMK) when you need stricter control over key rotation or policies.
- **Bastion / Jump host (optional)**: If you want SSH / administrative access to the private subnet from the public internet, you should place a bastion host in a public subnet with limited ingress (IP whitelisting) + updated Security gruops. Once connected to the bastion, you can securily connect to the private subnet.

---

## 5. Operational & Reliability flow

- **Deployment Strategy:** Use safe deployment patterns (blue/green, canary, or rolling with health checks) in ECS to minimize downtime or errors.
- **Immutable Infrastructure:** Use versioned container images, immutable tags (avoid latest), and ensure reproducible builds.
- **CI/CD Pipeline:** There are 3 pipelines: (1) validate/test code, (2) build and push container image to ECR, (3) update ECS task definitions and trigger deployments (with manual approval gates for prod).
- **Maintenance Windows & Upgrades:** AWS will manage your services for you, but this also involes updates. If your RDS (DB) needs an major upgrade, it will restart and involve downtime if other applications rely on its availability).
  • Define maintenance windows (for database patching, OpenSearch cluster changes, etc.).
  • Automate safe upgrades and minimize impact on production (e.g. upgrade replicas first, test, then switch).
