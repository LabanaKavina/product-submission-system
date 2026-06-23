# Use Node.js 18 LTS base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies for build tools and MySQL client
RUN apk add --no-cache python3 make g++ mysql-client

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose backend port
EXPOSE 5000

# Start application with nodemon for hot-reload
CMD ["npm", "run", "dev"]
