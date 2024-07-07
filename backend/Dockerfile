# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the application source code to the container
COPY . .

# Run the application
CMD ["npm", "start"]

# Expose the port that the application runs on
EXPOSE 3000
