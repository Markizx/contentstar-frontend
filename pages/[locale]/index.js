import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home({ initialLocale }) {
  console.log('Rendering pages/[locale]/index.js with initialLocale:', initialLocale);

  const router = useRouter();
  const { locale } = router;

  console.log('Router locale:', locale);

  return (
    <div>
      <h1>ContentStar - Locale: {locale || initialLocale}</h1>
      <p>This is a test page to ensure rendering works.</p>
    </div>
  );
}

export async function getStaticPaths() {
  console.log('getStaticPaths called');
  return {
    paths: [
      { params: { locale: 'en' } },
      { params: { locale: 'ru' } },
      { params: { locale: 'uk' } },
      { params: { locale: 'es' } },
      { params: { locale: 'de' } },
      { params: { locale: 'fr' } },
    ],
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  console.log('getStaticProps called with params:', params);
  const initialLocale = params?.locale || 'en';
  return {
    props: {
      initialLocale,
    },
  };
}