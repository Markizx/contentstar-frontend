import '../i18n';
import { SessionProvider } from 'next-auth/react';
import i18n from 'i18next';
import '../styles/global.css';

export default function App({ Component, pageProps }) {
  const { session, initialLocale, ...restPageProps } = pageProps || {};
  if (initialLocale && i18n.language !== initialLocale) {
    i18n.changeLanguage(initialLocale);
  }

  return (
    <SessionProvider session={session}>
      <Component {...restPageProps} initialLocale={initialLocale} />
    </SessionProvider>
  );
}

App.getInitialProps = async ({ ctx }) => {
  const { req, query } = ctx;
  const locale = query.locale || req?.url?.split('/')[1] || 'en';
  return {
    initialLocale: locale,
  };
};