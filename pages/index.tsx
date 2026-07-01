import Header from "../app/components/header";
import Footer from "../app/components/Footer";


export default function Home() {
  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto p-8">
        <h2 className="text-5xl font-bold mb-4">
          Welcome to Note of Life
        </h2>

        <p className="text-gray-600 text-lg">
          Write your thoughts, preserve memories, and revisit every moment of
          your journey.
        </p>
      </main>
      <Footer />
    </>
  );
}