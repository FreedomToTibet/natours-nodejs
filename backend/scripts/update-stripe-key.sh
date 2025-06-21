#!/bin/bash

# Script to safely update your Stripe keys in config.env
# without risking them being committed to Git

# Check if config.env exists
if [ ! -f config.env ]; then
  echo "Error: config.env not found!"
  exit 1
fi

# Prompt for the Stripe secret key
read -p "Enter your Stripe secret key (sk_test_...): " stripe_secret

# Update the config.env file
sed -i "s/^STRIPE_SECRET=.*$/STRIPE_SECRET=$stripe_secret/" config.env

echo "Successfully updated Stripe secret key in config.env"
echo "Remember: This key is only stored locally and won't be committed to Git"
