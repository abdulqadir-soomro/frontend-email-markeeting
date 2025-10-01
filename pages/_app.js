import '../public/styles.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Email Marketing Dashboard - SAYNIN TECH</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;