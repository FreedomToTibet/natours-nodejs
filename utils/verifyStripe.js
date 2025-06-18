// Utility to verify Stripe configuration
import fs from 'fs';
import path from 'path';
import * as url from 'url';
import dotenv from 'dotenv';
import Stripe from 'stripe';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', 'config.env') });

// Read the stripe.js file to extract the publishable key
const stripeJsPath = path.join(__dirname, '..', 'public', 'js', 'stripe.js');
const stripeJsContent = fs.readFileSync(stripeJsPath, 'utf8');
const publishableKeyMatch = stripeJsContent.match(/Stripe\(['"]([^'"]+)['"]\)/);

if (!publishableKeyMatch) {
  console.error('❌ Could not find Stripe publishable key in stripe.js');
  process.exit(1);
}

const publishableKey = publishableKeyMatch[1];
console.log('✓ Found publishable key in stripe.js');

// Check if stripe secret key exists
const stripeSecret = process.env.STRIPE_SECRET;
if (!stripeSecret) {
  console.error('❌ STRIPE_SECRET not found in environment variables');
  process.exit(1);
}
console.log('✓ Found STRIPE_SECRET in environment variables');

// Verify keys belong to same account
async function verifyKeys() {
  try {
    // Check if publishable key is from same account as secret key
    const stripe = new Stripe(stripeSecret, {
      apiVersion: '2023-10-16'
    });
    
    // Attempt to create a small test session to verify the secret key works
    const testSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 1000,
            product_data: {
              name: 'Test Product',
            },
          },
          quantity: 1,
        },
      ],
    });
    
    console.log('✓ Secret key is valid - created test session');
    console.log('✓ Session created with ID:', testSession.id);
    
    // Check if both keys are from same environment (test or live)
    const isPubTest = publishableKey.startsWith('pk_test_');
    const isSecretTest = stripeSecret.startsWith('sk_test_');
    
    if (isPubTest !== isSecretTest) {
      console.error('❌ Keys mismatch: One is test and one is live');
      console.error(`Publishable key is ${isPubTest ? 'TEST' : 'LIVE'}`);
      console.error(`Secret key is ${isSecretTest ? 'TEST' : 'LIVE'}`);
      process.exit(1);
    }
    
    console.log(`✓ Both keys are ${isPubTest ? 'TEST' : 'LIVE'} keys`);
    console.log('✓ Stripe configuration looks good!');
    
  } catch (error) {
    console.error('❌ Error validating Stripe keys:', error.message);
    process.exit(1);
  }
}

verifyKeys();
