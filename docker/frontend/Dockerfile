# Use a specific version of Node.js
FROM node:20

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application files into the container
COPY . .

# Expose the port that Vite (or your app) will run on (e.g., port 5173 for Vite)
EXPOSE 5173

# Start the development server (adjust if you use another tool like React or Vite)
CMD ["npm", "run", "dev"]