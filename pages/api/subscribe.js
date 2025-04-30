import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getSecrets } from '../utils/getSecrets';

let stripePromise;

const initializeStripe = async () => {
  const secrets = await getSecrets();
  return loadStripe(secrets.STRIPE_PUBLISHABLE_KEY);
};

if (typeof window !== 'undefined') {
  stripePromise = initializeStripe();
}

export default function Subscribe() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!session) {
      alert(t('pleaseSignIn'));
      return;
    }
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          email: email || session.user.email,
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.BACKEND_URL}/api/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          email: email || session.user.email,
          paymentMethodId: paymentMethod.id,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccess(t('subscriptionSuccess'));
      } else {
        setError(result.error || t('subscriptionFailed'));
      }
    } catch (err) {
      setError(t('subscriptionError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-blue to-blue-600 text-white font-inter flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card p-6 max-w-md w-full"
      >
        <h1 className="text-2xl font-bold mb-4">{t('subscribe')}</h1>
        {!session ? (
          <p>{t('pleaseSignIn')}</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2">{t('email')}</label>
              <input
                type="email"
                value={email || session.user.email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-file w-full"
                placeholder={session.user.email}
                disabled={!!session.user.email}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">{t('cardDetails')}</label>
              <CardElement className="p-2 border rounded-lg bg-gray-800 text-white" />
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">{success}</p>}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!stripe || loading}
              className="button-upload w-full"
            >
              {loading ? t('loading') : t('subscribeNow')}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export function getServerSideProps({ params }) {
  const initialLocale = params?.locale || 'en';
  return {
    props: {
      initialLocale,
    },
  };
}