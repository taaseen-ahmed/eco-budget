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

# Copy the nginx configuration - we'll use it as template
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Create an entrypoint script to handle SSL certificates
RUN echo '#!/bin/sh \n\
envsubst < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf \n\
exec "$@"' > /docker-entrypoint.sh && \
chmod +x /docker-entrypoint.sh

# Expose the ports
EXPOSE 80 443

# Start Nginx with our entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]
