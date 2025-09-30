# Development Environment Instructions

This project is fully containerized for a consistent and easy-to-manage development experience using Docker and Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (Included with Docker Desktop for Mac and Windows)

## Usage

1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Build and start the services:**
    Run the following command from the root of the project:
    ```sh
    docker-compose up --build
    ```
    This command will:
    - Build the Docker image for the Node.js application.
    - Pull the required images for MySQL, Redis, and Elasticsearch.
    - Start all the services and connect them on a shared network.
    - The `-d` flag can be added to run the containers in the background (`docker-compose up --build -d`).

3.  **Access the service:**
    The API will be available at `http://localhost:3000`. You can test it by accessing the health check endpoint: `http://localhost:3000/ping`.

4.  **Stopping the services:**
    To stop all running containers, press `Ctrl+C` in the terminal where `docker-compose` is running, or run the following command from another terminal:
    ```sh
    docker-compose down
    ```
    To remove the persistent data volumes as well, use `docker-compose down -v`.

## Interacting with the Service

The `scripts/` directory contains a set of helper scripts for interacting with the service's API endpoints. Once the service is running, you can use these scripts from another terminal.

- **`scripts/add_asset.sh`**: Populates the database with three sample crypto assets.
- **`scripts/count.sh`**: Retrieves the total count of assets.
- **`scripts/get.sh`**: Retrieves a specific asset by its ID.
- **`scripts/search.sh`**: Performs a search query for assets.

**Example Usage:**

```sh
# Make sure the scripts are executable
chmod +x scripts/*.sh

# Add sample data
./scripts/add_asset.sh

# Get the total count
./scripts/count.sh
```
