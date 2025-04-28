import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <meta httpEquiv="refresh" content="0;url=/en" />
      </Head>
      <div>
        <p>Redirecting to /en...</p>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  return {
    redirect: {
      destination: '/en',
      permanent: false,
    },
  };
}