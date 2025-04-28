import Stripe from 'stripe';

   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
     apiVersion: '2022-11-15',
   });

   export default async function handler(req, res) {
     if (req.method !== 'POST') {
       return res.status(405).json({ error: 'Method not allowed' });
     }

     try {
       const { email, paymentMethodId } = req.body;
       const customer = await stripe.customers.create({
         email,
         payment_method: paymentMethodId,
         invoice_settings: { default_payment_method: paymentMethodId },
       });

       const subscription = await stripe.subscriptions.create({
         customer: customer.id,
         items: [{ price: 'price_xxxxxxxxxxxxxxxxxxxxxxxx' }], // Замени на свой price ID
         expand: ['latest_invoice.payment_intent'],
       });

       return res.status(200).json({ subscription });
     } catch (error) {
       console.error('Error creating subscription:', error);
       return res.status(500).json({ error: 'Failed to create subscription' });
     }
   }