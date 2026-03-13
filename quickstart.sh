#!/bin/bash

# BDAsk Super AI Quick Start Script
# Usage: ./quickstart.sh

set -e

echo "🚀 BDAsk Super AI Quick Start"
echo "=============================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher${NC}"
    echo "Current version: $(node -v)"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm $(npm -v)${NC}"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Setup environment
echo ""
echo "⚙️  Setting up environment..."

if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env file with your API keys${NC}"
    echo "   Required: GEMINI_API_KEY"
    echo "   Optional: SERPER_API_KEY (for web search)"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Create workspace directory
if [ ! -d workspace ]; then
    mkdir -p workspace
    echo -e "${GREEN}✓ Created workspace directory${NC}"
fi

# Run tests
echo ""
echo "🧪 Running tests..."
npm test || echo -e "${YELLOW}⚠️  Some tests failed (this is OK if Gemini API key is not set)${NC}"

# Start server
echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the server:"
echo "  npm start        # Production mode"
echo "  npm run dev      # Development mode with auto-reload"
echo ""
echo "API will be available at: http://localhost:5000"
echo "Health check: http://localhost:5000/health"
echo ""
echo -e "${YELLOW}Don't forget to:${NC}"
echo "1. Add your GEMINI_API_KEY to .env file"
echo "2. Configure WORKSPACE_ROOT if needed"
echo "3. Set up MongoDB if you want conversation persistence"
echo ""

# Ask to start now
read -p "Start the server now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting server..."
    npm run dev
fi
