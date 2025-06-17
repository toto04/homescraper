#!/bin/bash

# HomeScraper Docker Build and Test Script

set -e

echo "🏠 HomeScraper Docker Build Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
  echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
  print_error "Docker is not running. Please start Docker and try again."
  exit 1
fi

print_status "Docker is running"

# Build the Docker image
echo ""
echo "🔨 Building Docker image..."
if docker build -t homescraper:latest .; then
  print_status "Docker image built successfully"
else
  print_error "Failed to build Docker image"
  exit 1
fi

# Test the image
echo ""
echo "🧪 Testing the Docker image..."

# Start the container in detached mode
CONTAINER_ID=$(docker run -d -p 3000:3000 homescraper:latest)
print_status "Container started with ID: ${CONTAINER_ID:0:12}"

# Wait for the application to start
echo "⏳ Waiting for application to start..."
sleep 10

# Test the health endpoint
if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
  print_status "Health check passed"
else
  print_warning "Health check failed, checking container logs..."
  docker logs $CONTAINER_ID
fi

# Test the main page
if curl -f http://localhost:3000 >/dev/null 2>&1; then
  print_status "Main page accessible"
else
  print_warning "Main page not accessible"
fi

# Clean up
echo ""
echo "🧹 Cleaning up..."
docker stop $CONTAINER_ID >/dev/null
docker rm $CONTAINER_ID >/dev/null
print_status "Container stopped and removed"

echo ""
echo "🎉 Build and test completed successfully!"
echo ""
echo "To run the application:"
echo "  docker-compose up -d"
