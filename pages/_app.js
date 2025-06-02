// pages/_app.js
import "semantic-ui-css/semantic.min.css";   // ← global import for Semantic UI

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
