# Use Node.js 18 LTS base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose frontend port
EXPOSE 3000

# Start React development server with hot-reload
CMD ["npm", "start"]
