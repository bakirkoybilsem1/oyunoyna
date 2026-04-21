"use client";
import { motion } from "framer-motion";

const oyunlar = [
  { id: 1, isim: "Boyama", renk: "#FF5733", link: "https://vercel.com/bakbi/oyun1" },
  { id: 2, isim: "Yapboz", renk: "#33FF57", link: "https://vercel.com/bakbi/oyun2" },
  { id: 3, isim: "Araba", renk: "#3357FF", link: "https://vercel.com/bakbi/oyun3" },
  { id: 4, isim: "Eşleştirme", renk: "#F333FF", link: "https://vercel.com/bakbi/oyun4" },
];

export default function Home() {
  return (
    <main className="relative min-h-screen bg-sky-300 overflow-hidden flex flex-wrap justify-around items-center p-10">
      {/* Gökyüzü Animasyonlu Bulutlar */}
      <div className="absolute top-10 left-10 w-32 h-10 bg-white opacity-60 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-40 right-20 w-48 h-16 bg-white opacity-40 rounded-full blur-2xl" />

      {/* Uçurtma Şeklinde Oyunlar */}
      {oyunlar.map((oyun) => (
        <motion.div
          key={oyun.id}
          animate={{ y: [0, -30, 0], rotate: [-3, 3, -3] }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative group m-10"
        >
          <a href={oyun.link} target="_blank" rel="noopener noreferrer">
            <div 
              style={{ backgroundColor: oyun.renk }} 
              className="w-28 h-28 rotate-45 border-4 border-white shadow-2xl flex items-center justify-center transition-transform group-hover:scale-110"
            >
              <span className="-rotate-45 text-white font-bold text-lg select-none text-center px-1">
                {oyun.isim}
              </span>
            </div>
            {/* Uçurtma Kuyruğu */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="w-1 h-20 bg-white/50" />
              <div className="w-4 h-2 bg-pink-400 rounded-full -mt-16" />
              <div className="w-4 h-2 bg-yellow-300 rounded-full mt-4" />
              <div className="w-4 h-2 bg-blue-400 rounded-full mt-4" />
            </div>
          </a>
        </motion.div>
      ))}

      <h1 className="absolute bottom-8 w-full text-center text-white text-4xl font-black tracking-widest drop-shadow-lg uppercase">
        🪁 Bakbi Oyun Parkı 🪁
      </h1>
    </main>
  );
}
