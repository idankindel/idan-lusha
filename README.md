A brief description of your project.

Prerequisites
Before running the project, make sure you have the following installed on your machine:

Docker package
Docker Compose package
VSCode with the Docker extension
Node.js installed
Setup Instructions
Development Mode
To run the project in development mode, follow these steps:

Clone the repository:

bash
Copy code
git clone <repository-url>
cd <repo-directory>
Build and start the Docker containers for development:

bash
Copy code
docker compose -f docker-compose.dev.yml up --build -d
Optional: Attach VSCode to the Docker container:

Open VSCode and navigate to the Docker extension.
Find idan-lusha-parser_service in the list of containers.
Right-click and select Attach Visual Studio Code.
Run the development server inside the container:

Once attached to the container, run:

bash
Copy code
npm run dev
Press F5 in VSCode to start debugging.

Production Mode
To run the project in production mode, follow these steps:

Clone the repository (if not done already):

bash
Copy code
git clone <repository-url>
cd <repo-directory>
Build and start the Docker containers for production:

bash
Copy code
docker compose -f docker-compose.prod.yml up --build -d
Ensure that the ports in the Docker Compose file are not already in use on your machine.

Assumptions & Logic
Link Filter Logic: The project assumes that the relevant links are found within the <head> tag of the HTML. Although the link filtering logic could be improved, this assumption is made for simplicity.

HTML Parsing: Only the <head> section of the HTML is parsed to avoid inserting large HTML content into the database. This minimizes the risk of errors from inserting large strings and helps manage the data more efficiently.

Things to Improve/Add
Redis & MongoDB Connections: The project is organized in Docker containers but needs more robust handling of Redis and MongoDB connections. Ensure that environment variables are used to configure the connection strings for both services.

Queue Manager Recursive Limit: Add a limit for recursive calls in the queue manager to avoid excessive queries and potential infinite loops.

Redis Caching: Use Redis to store only URL keys as a cache, which will reduce the load on MongoDB. Implement an expiration time for cache entries to prevent stale data.

Server Protection: Add middleware to protect the server. This can include rate limiting, authentication, and logging to ensure that the APIs are secure and not subject to abuse.

Dockerfile Optimization: In the production Dockerfile, only necessary files should be copied. Update the Dockerfile to avoid copying unnecessary files and to include only the production-ready assets.

Testing: The project is focused on the core logic and Docker setup, but it lacks sufficient testing. It’s recommended to write unit tests for the core logic and integration tests for Dockerized services. Use testing frameworks like Jest or Mocha for Node.js.

Notes & Acknowledgments
Thank you for the opportunity to work on this assignment. During the project, I deepened my knowledge of Docker and Redis, which I wasn't fully familiar with before. I also learned how to organize the project in Docker containers for better scalability and deployment.

Although I don’t have much experience writing tests, I’m eager to expand my skills in this area in the future.

