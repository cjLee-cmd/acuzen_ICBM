#!/bin/bash

# Acuzen ICBM Development Setup Script
# 개발 환경 설정 스크립트

echo "🚀 Setting up Acuzen ICBM development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs uploads public/uploads

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
fi

# Set executable permissions for scripts
chmod +x scripts/*.sh

echo "🎉 Setup complete! You can now run:"
echo "  npm run dev    # Start development server"
echo "  npm test       # Run tests"
echo "  npm run build  # Build project"

echo ""
echo "Don't forget to:"
echo "1. Edit .env file with your configuration"
echo "2. Set up your database"
echo "3. Review the documentation in docs/"