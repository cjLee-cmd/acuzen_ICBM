#!/bin/bash

# Publishing을 위한 빌드 스크립트
echo "Building for publishing..."

# 1. 기존 빌드 실행
npm run build

# 2. dist/public의 내용을 dist로 복사 (index.html이 dist 루트에 위치하도록)
if [ -d "dist/public" ]; then
    echo "Moving files from dist/public to dist..."
    cp -r dist/public/* dist/
    rm -rf dist/public
    echo "Files moved successfully!"
    echo "index.html is now located at: dist/index.html"
else
    echo "Warning: dist/public directory not found"
fi

echo "Build for publishing completed!"