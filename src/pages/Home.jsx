import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Home() {
  const slides = [
    "src/assets/image/WhatsApp Image 2025-10-21 at 19.27.02_59de1b8b.jpg",
    "src/assets/image/WhatsApp Image 2025-10-21 at 19.27.02_61ea5b85.jpg",
    "src/assets/image/WhatsApp Image 2025-10-21 at 19.27.35_5b8c6895.jpg",
    "src/assets/image/WhatsApp Image 2025-10-21 at 19.27.35_71d5473b.jpg",
    "src/assets/image/WhatsApp Image 2025-10-21 at 19.27.37_4bc4aceb.jpg",
    "src/assets/image/WhatsApp Image 2025-10-21 at 19.27.37_b70ed23c.jpg",
    "src/assets/image/WhatsApp Image 2025-10-21 at 19.27.39_99fb112f.jpg",
    "src/assets/image/WhatsApp Image 2025-10-21 at 19.27.40_9e63f7d7.jpg",
    "src/assets/image/WhatsApp Image 2025-10-21 at 19.27.40_363e2645.jpg",
    "src/assets/image/WhatsApp Image 2025-10-21 at 19.27.44_0dc8311c.jpg",
  ];

  const [current, setCurrent] = useState(0);

  // Auto-slide every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="bg-slate-900 text-slate-100 min-h-full flex flex-col ">
      {/* 🖼️ Banner Section */}
      <div
        className="relative w-full h-[320px] md:h-[400px] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/images/library-banner.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-lg">
            Welcome to the Intranet Library
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl">
            Explore academic resources, research materials, and institutional
            publications all in one place.
          </p>
          {/* <div className="mt-6">
            <Link
              to="/search"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold text-white transition-all"
            >
              Search Materials
            </Link>
          </div> */}
        </div>
      </div>

      {/* 🏫 About Section */}
      <section className="max-w-5xl mx-auto text-center py-12 px-4">
        <h2 className="text-3xl font-bold text-indigo-400 mb-4">
          About the Library System
        </h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mx-auto">
          The Intranet Library System is designed to simplify academic resource
          management within the institution. It allows students and staff to
          search, borrow, and access books, journals, theses, and other
          educational materials efficiently. Our goal is to make knowledge
          accessible, organized, and smart through technology.
        </p>
      </section>

      {/* 🎞️ Image Slideshow */}
      <section className="relative w-full max-w-6xl mx-auto rounded-xl overflow-hidden shadow-lg mb-12 px-4">
        <div className="relative h-[300px] md:h-[450px] rounded-xl">
          <img
            src={slides[current]}
            alt={`Library view ${current + 1}`}
            className="w-full h-full object-cover transition-all duration-1000 ease-in-out rounded-xl"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === current ? "bg-indigo-500 scale-125" : "bg-gray-500"
                }`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* 📚 CTA Section */}
      <section className="text-center py-10 bg-slate-800/60 px-4">
        <h3 className="text-2xl font-semibold mb-2">
          Start Exploring Our Digital Library
        </h3>
        <p className="text-gray-400 mb-6">
          Find academic materials across multiple categories and departments.
        </p>
        <Link
          to="/search"
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition"
        >
          Begin Search
        </Link>
      </section>

      {/* 🦶 Footer */}
      <footer className="bg-slate-950 py-6 mt-auto text-center text-gray-400 text-sm border-t border-slate-700">
        <p>© {new Date().getFullYear()} Intranet Library System</p>
        <p className="mt-1">
          Developed for <span className="text-indigo-400">Federal University Birnin Kebbi</span>
        </p>
      </footer>
    </div>
  );
}
