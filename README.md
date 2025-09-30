# Asset Service

This service provides an API for managing assets with support for persistent storage, search, and caching capabilities.

## Database Dependencies

The service is compatible with the following database versions:

- **MySQL**: 5.7
- **Redis**: 6.x
- **Elasticsearch**: 7.17

## Environment Variables

The service can be configured using the following environment variables:

### MySQL Configuration
- `MYSQL_HOST` (default: 'mysql')
- `MYSQL_PORT` (default: 3306)
- `MYSQL_USER` (default: 'root')
- `MYSQL_PASSWORD` (default: 'test')
- `MYSQL_DATABASE` (default: 'test')

### Elasticsearch Configuration
- `ELASTICSEARCH_URL` (default: 'http://elasticsearch:9200')

### Redis Configuration
- `REDIS_HOST` (default: 'redis')
- `REDIS_PORT` (default: 6379)

## API Endpoints

### Asset Management
- `POST /assets/add`
  - Adds a new asset to the system
  - Request body: Asset object
  - Response: 201 Created

- `GET /assets/get?id={id}`
  - Retrieves an asset by its ID
  - Query parameters: `id` (number)
  - Response: 200 OK with asset object or 404 Not Found

### Search and Statistics
- `POST /assets/search?query={query}`
  - Searches for assets using the provided query
  - Query parameters: `query` (string)
  - Response: 200 OK with array of matching assets
  - Note: Limited to 10 results per query

- `GET /assets/count`
  - Returns the total count of assets in the system
  - Response: 200 OK with count object
  - Note: Result is cached for performance

### Health Check
- `GET /ping`
  - Health check endpoint
  - Response: 200 OK with "OK" message

## Running the Service

The service runs on port 3000 by default. Make sure all required databases are running and accessible before starting the service.

## Development

The service is built with:
- Node.js 16
- Express.js
- TypeScript
