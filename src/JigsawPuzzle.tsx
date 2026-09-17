import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { BOOKS } from "./books";

interface JigsawProps {
  open: boolean;
  onClose: () => void;
  lang?: string;
  accent?: string;
}

type Dir = -1 | 0 | 1;

// One jigsaw piece outline (semicircle-knob tabs), verified to interlock.
function piecePath(top: Dir, right: Dir, bottom: Dir, left: Dir, sw: number, sh: number, k: number, m: number): string {
  const x0 = m, y0 = m, x1 = m + sw, y1 = m + sh;
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  const p: string[] = [`M ${x0} ${y0}`];
  // top: left->right; tab(+1)=up -> sweep 0
  if (top === 0) p.push(`L ${x1} ${y0}`);
  else { const s = top > 0 ? 0 : 1; p.push(`L ${mx - k} ${y0}`, `A ${k} ${k} 0 0 ${s} ${mx + k} ${y0}`, `L ${x1} ${y0}`); }
  // right: top->bottom; tab(+1)=right -> sweep 1
  if (right === 0) p.push(`L ${x1} ${y1}`);
  else { const s = right > 0 ? 1 : 0; p.push(`L ${x1} ${my - k}`, `A ${k} ${k} 0 0 ${s} ${x1} ${my + k}`, `L ${x1} ${y1}`); }
  // bottom: right->left; tab(+1)=down -> sweep 1
  if (bottom === 0) p.push(`L ${x0} ${y1}`);
  else { const s = bottom > 0 ? 1 : 0; p.push(`L ${mx + k} ${y1}`, `A ${k} ${k} 0 0 ${s} ${mx - k} ${y1}`, `L ${x0} ${y1}`); }
  // left: bottom->top; tab(+1)=left -> sweep 1
  if (left === 0) p.push(`L ${x0} ${y0}`);
  else { const s = left > 0 ? 1 : 0; p.push(`L ${x0} ${my + k}`, `A ${k} ${k} 0 0 ${s} ${x0} ${my - k}`, `L ${x0} ${y0}`); }
  p.push("Z");
  return p.join(" ");
}

interface Piece { id: number; r: number; c: number; x: number; y: number; placed: boolean; z: number; d: string; }

export default function JigsawPuzzle({ open, onClose, lang = "en", accent = "#8b5cf6" }: JigsawProps) {
  const T = (en: string, es: string, fr: string, pt: string) =>
    lang === "es" ? es : lang === "fr" ? fr : lang === "pt" ? pt : en;

  const images = useMemo(() => BOOKS.filter((b) => b.cover).map((b) => ({ id: b.id, url: b.cover as string, title: b.titleEn })), []);
  const [imgUrl, setImgUrl] = useState<string>(images[0]?.url || "");
  const [N, setN] = useState<number>(3);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [won, setWon] = useState(false);
  const areaRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ id: number; ox: number; oy: number } | null>(null);
  const zTop = useRef(10);

  // board geometry (portrait 3:4 to match covers)
  const geom = useCallback(() => {
    const area = areaRef.current;
    const W = area ? area.clientWidth : 320;
    const sw = Math.min(Math.floor((W - 24) / N), Math.floor(300 / N));
    const sh = Math.round(sw * 1.2);
    const k = Math.round(Math.min(sw, sh) * 0.2);
    const m = k;
    const boardW = sw * N, boardH = sh * N;
    const boardX = Math.round((W - boardW) / 2);
    const boardY = 8;
    return { sw, sh, k, m, boardW, boardH, boardX, boardY };
  }, [N]);

  const [g, setG] = useState(geom());

  const build = useCallback(() => {
    const area = areaRef.current; if (!area) return;
    const gg = geom(); setG(gg);
    const { sw, sh, k, m, boardX, boardY, boardW, boardH } = gg;
    // random complementary edges
    const h: Dir[][] = Array.from({ length: N - 1 }, () => Array.from({ length: N }, () => (Math.random() < 0.5 ? -1 : 1) as Dir));
    const v: Dir[][] = Array.from({ length: N }, () => Array.from({ length: N - 1 }, () => (Math.random() < 0.5 ? -1 : 1) as Dir));
    const W = area.clientWidth, H = area.clientHeight;
    const trayTop = boardY + boardH + 10;
    const list: Piece[] = [];
    let id = 0;
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const top: Dir = r === 0 ? 0 : (-(h[r - 1][c]) as Dir);
      const bottom: Dir = r === N - 1 ? 0 : h[r][c];
      const left: Dir = c === 0 ? 0 : (-(v[r][c - 1]) as Dir);
      const right: Dir = c === N - 1 ? 0 : v[r][c];
      const d = piecePath(top, right, bottom, left, sw, sh, k, m);
      // scatter in tray region
      const x = 6 + Math.random() * Math.max(10, W - (sw + 2 * m) - 12);
      const y = trayTop + Math.random() * Math.max(10, (H - trayTop) - (sh + 2 * m) - 8);
      list.push({ id: id++, r, c, x, y, placed: false, z: 1, d });
    }
    setPieces(list); setWon(false);
  }, [N, geom]);

  useEffect(() => { if (open) { const t = setTimeout(build, 30); return () => clearTimeout(t); } }, [open, N, imgUrl, build]);

  const onDown = (e: React.PointerEvent, p: Piece) => {
    if (p.placed) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const rect = areaRef.current!.getBoundingClientRect();
    drag.current = { id: p.id, ox: e.clientX - rect.left - p.x, oy: e.clientY - rect.top - p.y };
    zTop.current += 1;
    setPieces((prev) => prev.map((q) => (q.id === p.id ? { ...q, z: zTop.current } : q)));
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    e.preventDefault();
    const rect = areaRef.current!.getBoundingClientRect();
    const nx = e.clientX - rect.left - drag.current.ox;
    const ny = e.clientY - rect.top - drag.current.oy;
    setPieces((prev) => prev.map((q) => (q.id === drag.current!.id ? { ...q, x: nx, y: ny } : q)));
  };
  const onUp = () => {
    if (!drag.current) return;
    const id = drag.current.id; drag.current = null;
    const { sw, sh, m, boardX, boardY } = g;
    setPieces((prev) => {
      const next = prev.map((q) => {
        if (q.id !== id) return q;
        const targetX = boardX + q.c * sw - m;
        const targetY = boardY + q.r * sh - m;
        const dist = Math.hypot(q.x - targetX, q.y - targetY);
        if (dist < Math.min(sw, sh) * 0.45) return { ...q, x: targetX, y: targetY, placed: true, z: 0 };
        return q;
      });
      if (next.every((q) => q.placed)) setWon(true);
      return next;
    });
  };

  if (!open) return null;
  const { sw, sh, m, boardX, boardY, boardW, boardH } = g;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/70 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-full overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <h3 className="text-lg font-black text-slate-900">🧩 {T("Jigsaw Puzzle", "Rompecabezas", "Puzzle", "Quebra-cabeça")}</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 font-bold hover:bg-slate-200">✕</button>
        </div>

        <div className="p-4 space-y-3">
          {/* image picker */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((im) => (
              <button key={im.id} onClick={() => setImgUrl(im.url)} className={`shrink-0 w-11 h-14 rounded-lg overflow-hidden border-2 ${imgUrl === im.url ? "" : "border-slate-200"}`} style={imgUrl === im.url ? { borderColor: accent } : {}}>
                <img src={im.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1">
              {[3, 4].map((n) => (
                <button key={n} onClick={() => setN(n)} className={`px-3 py-2 rounded-xl text-xs font-bold border-2 ${N === n ? "text-white" : "bg-white text-slate-700 border-slate-200"}`} style={N === n ? { backgroundColor: accent, borderColor: accent } : {}}>
                  {n === 3 ? T("Easy", "Fácil", "Facile", "Fácil") : T("Hard", "Difícil", "Difficile", "Difícil")}
                </button>
              ))}
            </div>
          </div>

          {/* play area */}
          <div
            ref={areaRef}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
            className="relative w-full rounded-2xl bg-slate-100 overflow-hidden touch-none"
            style={{ height: 460, touchAction: "none" }}
          >
            {/* board outline + faint preview */}
            <div className="absolute rounded-md" style={{ left: boardX, top: boardY, width: boardW, height: boardH, outline: "2px dashed #cbd5e1", backgroundImage: `url(${imgUrl})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.14 }} />
            {/* tray divider hint */}
            <div className="absolute left-3 right-3 text-center text-[11px] font-bold text-slate-400" style={{ top: boardY + boardH + 4 }}>
              {T("Drag the pieces up to the board", "Arrastra las piezas al tablero", "Glisse les pièces vers le plateau", "Arraste as peças para o tabuleiro")}
            </div>
            {pieces.map((p) => {
              const box = sw + 2 * m, boxh = sh + 2 * m;
              return (
                <div
                  key={p.id}
                  onPointerDown={(e) => onDown(e, p)}
                  style={{
                    position: "absolute", left: p.x, top: p.y, width: box, height: boxh, zIndex: p.z,
                    cursor: p.placed ? "default" : "grab",
                    clipPath: `path('${p.d}')`, WebkitClipPath: `path('${p.d}')`,
                    backgroundImage: `url(${imgUrl})`,
                    backgroundSize: `${sw * N}px ${sh * N}px`,
                    backgroundPosition: `${m - p.c * sw}px ${m - p.r * sh}px`,
                    filter: p.placed ? "none" : "drop-shadow(0 3px 4px rgba(0,0,0,.3))",
                    transition: drag.current?.id === p.id ? "none" : "left .15s, top .15s",
                    touchAction: "none",
                  }}
                />
              );
            })}
            {won && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="font-black text-xl text-slate-900">{T("You solved it!", "¡Lo resolviste!", "Résolu !", "Você resolveu!")}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-2">
            <button onClick={build} className="px-5 py-2.5 rounded-full text-sm font-bold text-white shadow-md active:scale-95" style={{ backgroundColor: accent }}>
              🔀 {T("Shuffle / New", "Mezclar / Nuevo", "Mélanger / Nouveau", "Embaralhar / Novo")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
