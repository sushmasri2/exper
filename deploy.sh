#!/bin/bash
set -e

echo "Starting deployment..."

# Navigate to app directory
cd /var/www/cms-staging.medvarsity.com

# Pull latest changes
git pull origin  main  # or your main branch name

# Stop existing container
docker stop cms-ui-app || true
docker rm cms-ui-app || true

# Remove old image
docker rmi cms-ui || true

# Build new image
docker build -t cms-ui .

# Run new container
docker run -d \
  --name cms-ui-app \
  --restart unless-stopped \
  -p 4000:4000 \
  cms-ui

# Wait for container to be ready
sleep 10

# Check if container is running
if docker ps | grep -q cms-ui-app; then
    echo "Deployment successful!"
    echo "Application is running at: http://$(curl -s ifconfig.me):4000"
else
    echo "Deployment failed!"
    docker logs cms-ui-app
    exit 1
fi
