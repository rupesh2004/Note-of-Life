import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Header from "../app/components/header";
import Footer from "../app/components/Footer";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Header />
      <Component {...pageProps} />
      <Footer />
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}
