import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1N...', // Укажи ID цены из Stripe
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'https://contentstar.app/success',
      cancel_url: 'https://contentstar.app/cancel',
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
}