# Use the official Node.js image as the base image
FROM node:18 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the source code
COPY . .

# Build the React application
RUN npm run build

# Use a lightweight web server to serve the built frontend
FROM nginx:alpine

# Copy the build folder from the previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy the custom Nginx configuration file
COPY ./nginx.conf /etc/nginx/nginx.conf

# Expose the port the frontend will run on
EXPOSE 80

# Start Nginx to serve the React application
CMD ["nginx", "-g", "daemon off;"]
