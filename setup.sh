#!/bin/bash

# Early Bird Badge Setup Script

echo "Setting up Early Bird Badge development environment..."

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "dfx is not installed. Please install the Internet Computer SDK first."
    echo "Visit: https://internetcomputer.org/docs/current/developer-docs/setup/deploy-locally"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please update the .env file with your canister ID after deployment."
fi

# Start the local Internet Computer replica
echo "Starting local Internet Computer replica..."
dfx start --background

# Deploy the canister
echo "Deploying canister..."
dfx deploy

# Get the canister ID
CANISTER_ID=$(dfx canister id early_bird_badge)
echo "Canister ID: $CANISTER_ID"

# Update .env file with the canister ID
sed -i '' "s/NEXT_PUBLIC_EARLY_BIRD_BADGE_CANISTER_ID=/NEXT_PUBLIC_EARLY_BIRD_BADGE_CANISTER_ID=$CANISTER_ID/" .env

echo "Setup complete! You can now run the frontend with:"
echo "npm run dev" 