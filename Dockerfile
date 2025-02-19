# Use official Node.js LTS version as base image
FROM node:18-alpine AS base

# Set working directory inside container
WORKDIR /app

# Install dependencies (both production and dev dependencies)
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the TypeScript files
RUN npm run build

# Use the "dev" stage for running in development mode (using ts-node)
FROM base AS dev
# Install development dependencies
RUN npm install --only=dev

# Command to run the application in development mode
CMD ["npm", "dev"]

# Use the "start" stage for running the app in production mode
FROM base AS start
# Command to run the application in production mode
CMD ["npm", "start"]

# Use the "test" stage for running tests
FROM base AS test
# Install testing dependencies (if necessary)
RUN npm install --only=dev

# Command to run the tests
CMD ["npm", "test"]
