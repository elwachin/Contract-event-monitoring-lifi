# Fee Collector Event Monitoring

This project monitors and processes `FeeCollected` events from the Polygon blockchain using a FeeCollector contract. 
The events are fetched from the blockchain, parsed, and stored in MongoDB for further processing and querying. 
It also includes an API to interact with the stored events.

Once you run this script, it will automatically fetch all events starting from block 61500000 and save them to MongoDB. 
It splits the blocks into smaller chunks to prevent failure when dealing with large arrays of data.

If it encounters an issue, such as hitting an RPC limit or a database error, it will exit. 
The next time you run the script, it will resume querying from the last block it processed.

You can use the API endpoint to retrieve data for a specific integrator.
## Table of Contents

- [Setup](#setup)
- [Running the Application](#running-the-application)
- [Docker Setup](#docker-setup)
- [API Endpoints](#api-endpoints)

## Setup

1. Clone the repository.
   ```bash
    git clone https://github.com/elwachin/Contract-event-monitoring-lifi.git
    cd Contract-event-monitoring-lifi
   ```

2. Install the dependencies.
```bash 
npm install
```

3. Install mongodb.

4. Set up your environment variables. Create a .env file in the root of the project and add the necessary configurations

## Running the Application

To run the application in development mode:
```bash 
npm run dev
```

To run the test:
```bash 
npm test
```

To build the project and run it:
```bash
npm run build
npm start
```

## Docker Setup

1. To build and run the containers for testing, use:
```bash
docker-compose up --build app-test
```

2. Running the Application in Production:
```bash
docker-compose up --build app
```

3. Stopping Containers:
```bash
docker-compose down
```

## API Endpoints
The following API endpoints are available:
```script
GET /api/events/:integrator
```
Fetch events by integrator from MongoDB.
- Parameters:
integrator: The integrator identifier.
- Response:
A JSON array of event objects.

- Example Request:
```bash
GET http://localhost:5000/api/events/integrator_address
```
