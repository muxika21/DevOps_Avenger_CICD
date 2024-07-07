# Use the official Node.js image from the Docker Hub
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY backend/ .

# Expose port 3000 for the application
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
