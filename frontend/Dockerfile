# Use an official Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# --- ADD THIS LINE TO BUST THE CACHE ---
ENV CACHE_BUSTER=102

# Copy the rest of the application code
COPY . .

# Expose the port React runs on
EXPOSE 3000

# The command to start the app
CMD ["npm", "start"]