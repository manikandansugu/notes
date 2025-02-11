# Use Node.js official image
FROM node:latest

# Set working directory
WORKDIR /app/notes

# Copy package.json and install dependencies
COPY package.json . 

# Install nodemon globally
RUN npm install -g nodemon && npm install

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 9000

# Run the app
CMD ["nodemon", "index.js"]
