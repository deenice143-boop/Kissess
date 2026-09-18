import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BOOKS } from "./books";

const PALETTE = ["#ef4444", "#f97316", "#facc15", "#22c55e", "#1e6fd9", "#8b5cf6"];
const SCENES = 3;

export default function PhoneDemo({ lang = "en" }: { lang?: string }) {
  const [scene, setScene] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setScene((s) => {
        const next = (s + 1) % SCENES;
        if (next === 0) setCycle((c) => c + 1);
        return next;
      });
    }, 3400);
    return () => clearInterval(id);
  }, []);

  const T = (en: string, es: string, fr: string, pt: string) =>
    lang === "es" ? es : lang === "fr" ? fr : lang === "pt" ? pt : en;

  const withCovers = BOOKS.filter((b) => b.cover);
  const elem = BOOKS.find((b) => b.id === "elementary-101");
  const activeBook = withCovers[cycle % Math.max(withCovers.length, 1)] || withCovers[0];
  const coloringPage = elem?.coloringPages?.[0] || "";
  const puzzleCover = elem?.cover || withCovers[0]?.cover || "";

  const bookTitle =
    activeBook ? (lang === "es" ? activeBook.titleEs : lang === "fr" ? activeBook.titleFr : lang === "pt" ? (activeBook as any).titlePt || activeBook.titleEn : activeBook.titleEn) : "";

  const Badge = ({ children, color }: { children: React.ReactNode; color: string }) => (
    <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold text-white mb-3" style={{ backgroundColor: color }}>
      {children}
    </span>
  );

  const scenes = [
    // 0 — Book showcase
    <div key="books" className="flex flex-col items-center justify-center h-full px-4 text-center">
      <Badge color="#1e6fd9">📚 {T("The Series", "La Serie", "La Série", "A Série")}</Badge>
      {activeBook?.cover && (
        <motion.img
          key={activeBook.id}
          src={activeBook.cover}
          alt=""
          initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          className="w-36 rounded-xl shadow-2xl"
        />
      )}
      <p className="text-white font-extrabold text-sm mt-3 leading-tight">{bookTitle}</p>
      <p className="text-slate-400 text-[11px] mt-1">{T("Story + coloring in every book", "Cuento + colorear en cada libro", "Histoire + coloriage", "História + colorir")}</p>
    </div>,

    // 1 — Coloring preview
    <div key="color" className="flex flex-col items-center justify-center h-full px-4 text-center">
      <Badge color="#22c55e">🎨 {T("Color & Create", "Colorea y Crea", "Colorie et Crée", "Colorir e Criar")}</Badge>
      <div className="relative w-32 aspect-[3/4] bg-white rounded-xl overflow-hidden shadow-2xl">
        {[{ c: "#facc15", x: "18%", y: "20%", d: 0 }, { c: "#ef4444", x: "62%", y: "30%", d: 0.5 }, { c: "#1e6fd9", x: "30%", y: "62%", d: 1 }, { c: "#22c55e", x: "66%", y: "68%", d: 1.5 }].map((b, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{ backgroundColor: b.c, left: b.x, top: b.y, width: 44, height: 44, filter: "blur(2px)" }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.1, 1], opacity: [0, 0.75, 0.7] }}
            transition={{ duration: 1.2, delay: b.d, repeat: Infinity, repeatDelay: 1.4 }}
          />
        ))}
        {coloringPage && <img src={coloringPage} alt="" className="absolute inset-0 w-full h-full object-contain" />}
      </div>
      <div className="flex gap-1.5 mt-3">
        {PALETTE.map((c) => <span key={c} className="w-4 h-4 rounded-full" style={{ backgroundColor: c }} />)}
      </div>
    </div>,

    // 2 — Jigsaw teaser
    <div key="puzzle" className="flex flex-col items-center justify-center h-full px-4 text-center">
      <Badge color="#8b5cf6">🧩 {T("Puzzles", "Rompecabezas", "Puzzles", "Quebra-cabeças")}</Badge>
      <div className="grid grid-cols-3 gap-0.5 w-32 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl bg-slate-800">
        {Array.from({ length: 9 }).map((_, i) => {
          const r = Math.floor(i / 3), c = i % 3;
          return (
            <motion.div
              key={i}
              style={{ backgroundImage: `url(${puzzleCover})`, backgroundSize: "300% 300%", backgroundPosition: `${c * 50}% ${r * 50}%` }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: [0, 1, 1, 1], scale: [0.4, 1, 1, 1] }}
              transition={{ duration: 2.4, delay: i * 0.12, repeat: Infinity, repeatDelay: 0.6 }}
            />
          );
        })}
      </div>
      <p className="text-slate-400 text-[11px] mt-3">{T("Watch the picture come together", "Mira cómo se arma la imagen", "Regarde l'image se former", "Veja a imagem se formar")}</p>
    </div>,
  ];

  return (
    <div className="relative select-none">
      <style>{`
        @keyframes kdShimmer { 0% { background-position: 0% 50%; } 100% { background-position: 300% 50%; } }
        @keyframes kdFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .kd-shell { animation: kdShimmer 6s linear infinite; }
        .kd-shell::after { content:""; position:absolute; inset:-8px; border-radius:46px; background:inherit; background-size:300% 300%; filter:blur(18px); opacity:.5; z-index:-1; animation: kdShimmer 6s linear infinite; }
        .kd-phone { animation: kdFloat 5s ease-in-out infinite; }
      `}</style>
      <div
        className="kd-shell relative rounded-[42px] p-[5px]"
        style={{ background: "linear-gradient(130deg,#1e6fd9,#8b5cf6,#22c55e,#facc15,#ef4444,#1e6fd9)", backgroundSize: "300% 300%", width: "100%", maxWidth: 260 }}
      >
        <div className="kd-phone rounded-[38px] bg-[#0f1b2d] overflow-hidden flex flex-col w-full" style={{ aspectRatio: "9 / 18" }}>
          {/* notch */}
          <div className="w-24 h-1.5 bg-slate-700 rounded-full mx-auto mt-3 mb-1 shrink-0" />
          {/* status bar */}
          <div className="flex items-center justify-between px-5 text-[10px] font-bold text-slate-400 py-1 shrink-0">
            <span>9:41</span>
            <span className="flex gap-1"><span>📶</span><span>🔋</span></span>
          </div>
          {/* scene area */}
          <div className="relative flex-1 min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={scene}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                {scenes[scene]}
              </motion.div>
            </AnimatePresence>
          </div>
          {/* scene dots */}
          <div className="flex justify-center gap-1.5 pb-3 shrink-0">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full transition-colors" style={{ backgroundColor: scene === i ? "#facc15" : "#33465f" }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
