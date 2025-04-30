import { getSession } from 'next-auth/react';
import Stripe from 'stripe';
import { getSecrets } from '../utils/getsecrets';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const secrets = await getSecrets();
    const stripe = new Stripe(secrets.STRIPE_SECRET_KEY);
    const customer = await stripe.customers.create({
      email: session.user.email,
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: 'your_stripe_price_id' }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
}