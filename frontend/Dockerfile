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

# Install required packages for SSL handling
RUN apk add --no-cache openssl

# Copy the build folder from the previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Create directories for SSL certificates in case they don't exist
RUN mkdir -p /etc/nginx/ssl

# Create a script to check for SSL certificates and generate self-signed ones if needed
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo '# Check if SSL certificates exist' >> /docker-entrypoint.sh && \
    echo 'if [ ! -f "/etc/letsencrypt/live/eco-budget.co.uk/fullchain.pem" ] || [ ! -f "/etc/letsencrypt/live/eco-budget.co.uk/privkey.pem" ]; then' >> /docker-entrypoint.sh && \
    echo '  echo "SSL certificates not found. Creating self-signed certificates..."' >> /docker-entrypoint.sh && \
    echo '  mkdir -p /etc/nginx/ssl' >> /docker-entrypoint.sh && \
    echo '  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\' >> /docker-entrypoint.sh && \
    echo '    -keyout /etc/nginx/ssl/nginx.key \\' >> /docker-entrypoint.sh && \
    echo '    -out /etc/nginx/ssl/nginx.crt \\' >> /docker-entrypoint.sh && \
    echo '    -subj "/CN=eco-budget.co.uk"' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '  # Update Nginx config to use self-signed certificates' >> /docker-entrypoint.sh && \
    echo '  sed -i "s|ssl_certificate /etc/letsencrypt/live/eco-budget.co.uk/fullchain.pem;|ssl_certificate /etc/nginx/ssl/nginx.crt;|g" /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo '  sed -i "s|ssl_certificate_key /etc/letsencrypt/live/eco-budget.co.uk/privkey.pem;|ssl_certificate_key /etc/nginx/ssl/nginx.key;|g" /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'else' >> /docker-entrypoint.sh && \
    echo '  echo "Using Lets Encrypt certificates"' >> /docker-entrypoint.sh && \
    echo 'fi' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Start Nginx' >> /docker-entrypoint.sh && \
    echo 'exec "$@"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Copy the nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the ports
EXPOSE 80 443

# Start Nginx with our entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]