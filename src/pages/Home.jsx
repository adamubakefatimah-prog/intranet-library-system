import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Home() {
  const slides = [
    "src/assets/image/slide1.jpg.jpg",
    "src/assets/image/slide2.jpg.jpg",
    "src/assets/image/slide3.jpg.jpg",
    "src/assets/image/slide4.jpg.jpg",
    "src/assets/image/slide5.jpg.jpg",
    "src/assets/image/slide6.jpg.jpg",
    "src/assets/image/slide7.jpg.jpg",
    "src/assets/image/slide8.jpg.jpg",
    "src/assets/image/slide9.jpg.jpg",
    "src/assets/image/slide10.jpg.jpg",
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="bg-slate-900 text-slate-100 min-h-full flex flex-col">
      
      {/* Banner Section */}
      <div
        className="relative w-full h-[320px] md:h-[400px] bg-cover bg-center"
        style={{ backgroundImage: "url('/images/library-banner.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-lg">
            Welcome to the Intranet Library
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl">
            Discover, access, and borrow institutional academic resources with ease.
          </p>
        </div>
      </div>

      {/* About Section */}
      <section className="max-w-5xl mx-auto text-center py-12 px-4">
        <h2 className="text-3xl font-bold text-indigo-400 mb-4">
          About the Library System
        </h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mx-auto">
          The Intranet Library System enables seamless access to research materials,
          supports borrowing and returning, and ensures effective knowledge management
          within the institution.
        </p>
      </section>

      {/* Slideshow */}
      <section className="relative w-full max-w-6xl mx-auto rounded-xl overflow-hidden shadow-lg mb-12 px-4">
        <div className="relative h-[300px] md:h-[450px] rounded-xl transition-all duration-1000">
          <img
            src={slides[current]}
            alt={`Library slide ${current + 1}`}
            className="w-full h-full object-cover rounded-xl transition-opacity duration-1000 ease-in-out"
            loading="lazy"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === current
                    ? "bg-indigo-500 scale-125"
                    : "bg-gray-500 opacity-60"
                }`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-10 bg-slate-800/60 px-4">
        <h3 className="text-2xl font-semibold mb-2">
          Start Exploring Our Digital Library
        </h3>
        <p className="text-gray-400 mb-6">
          Browse our curated academic collections made for students and staff.
        </p>
        <Link
          to="/search"
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition"
        >
          Begin Search
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-6 mt-auto text-center text-gray-400 text-sm border-t border-slate-700">
        <p>© {new Date().getFullYear()} Intranet Library System</p>
        <p className="mt-1">
          Designed for <span className="text-indigo-400">Federal University Birnin Kebbi</span>
        </p>
      </footer>
    </div>
  );
}
