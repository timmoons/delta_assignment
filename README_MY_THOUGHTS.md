# Thoughts related to text;
"You can assume that the dev environment needs to run on each engineer's computer, which has the latest macOS version. The production environments will run on Linux inside AWS."
= (docker) containers  -> optimize containers later on to reduce size by optimizing layering (e.g. base image and layer).


"stateless node.js process"
= don't have to mount disks as EC2/fargate storage, clean EBS fine.

"API endpoints over HTTP"
= locally nginx, in AWS = ALB for layer 7 load balancing"

"It requires access to MySQL, Redis and ElasticSearch data stores"
= locally docker images connected through docker compose, but in AWS 
for KISS principle we could use AWS RDS, elasticache & opensearch as data stores


"provide alternative approaches and the trade-offs of using them."
=
EC2 vs fargate vs EKS

"mysql, redis, ES"
data store services self-managed (e.g. dedicated EC2 instances with saving plans)
vs managed by AWS


# Thoughts related to project;

"repos; ECR?"
where to store the images? where to store code?

"versions of mysql/redis/elasticsearch"
Service is compatible with versions, but service will need upgrading soon as some versions are old and not supported once you move to the cloud (e.g. mysql 5.7 EOL is oct 2023)
and elasticsearch is not available on Amazon OpenSearch Service. (Elasticsearch 7.10 is the last version supported on OpenSearch due to licensing changes after that.)
->
Options elasticsearch:
Downgrade to Elasticsearch 7.10 (may require code/config changes).
Migrate to OpenSearch 1.x or 2.x, which is based on Elasticsearch 7.10+ but has diverged.

Options for MySQL:
Upgrade to 8.0 (AWS recommendation)


"owasp security principles?"
I should make sure we do not run containers as root etc.
Follow owasp security standards

"github actions, gitlab runner, jenkins for future dedicated tooling env"

