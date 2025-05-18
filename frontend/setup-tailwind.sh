#!/bin/bash

# Install Tailwind CSS and its dependencies
npm install -D tailwindcss postcss autoprefixer
npm install @headlessui/react @heroicons/react@1.0.6

# Initialize Tailwind CSS if configuration files don't exist
if [ ! -f tailwind.config.js ]; then
  echo "Initializing Tailwind CSS..."
  npx tailwindcss init -p
fi

# Build the CSS
echo "Building the project..."
npm run build

echo "Setup complete! 🎉" 