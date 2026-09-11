import React, { useRef, useState, useEffect, useCallback } from "react";

interface ColoringCanvasProps {
  open: boolean;
  onClose: () => void;
  pages?: string[];        // URLs of transparent line-art pages
  lang?: string;
  accent?: string;
}

const PALETTE = [
  "#000000", "#6b7280", "#ffffff",
  "#ef4444", "#f97316", "#f59e0b", "#facc15",
  "#84cc16", "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#3b82f6", "#1e6fd9", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
  "#f472b6", "#a16207", "#7c3f1d", "#fca5a5", "#fcd34d",
];

const SIZES = { S: 4, M: 12, L: 28 } as const;
type SizeKey = keyof typeof SIZES;
type Tool = "pencil" | "brush" | "eraser";

const CW = 800;
const CH = 1035;

export default function ColoringCanvas({ open, onClose, pages = [], lang = "en", accent = "#1e6fd9" }: ColoringCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const undoStack = useRef<ImageData[]>([]);

  const [color, setColor] = useState("#ef4444");
  const [tool, setTool] = useState<Tool>("brush");
  const [size, setSize] = useState<SizeKey>("M");
  const [activePage, setActivePage] = useState<string | null>(pages[0] || null);

  const T = (en: string, es: string, fr: string, pt: string) =>
    lang === "es" ? es : lang === "fr" ? fr : lang === "pt" ? pt : en;

  const fillWhite = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CW, CH);
  }, []);

  // init canvas when opened
  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctxRef.current = ctx;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    fillWhite();
    undoStack.current = [];
  }, [open, fillWhite]);

  const pushUndo = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    try {
      undoStack.current.push(ctx.getImageData(0, 0, CW, CH));
      if (undoStack.current.length > 15) undoStack.current.shift();
    } catch { /* ignore */ }
  };

  const pos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (CW / rect.width),
      y: (e.clientY - rect.top) * (CH / rect.height),
    };
  };

  const start = (e: React.PointerEvent) => {
    e.preventDefault();
    const ctx = ctxRef.current;
    if (!ctx) return;
    pushUndo();
    drawing.current = true;
    last.current = pos(e);
    // dot on tap
    const p = last.current;
    ctx.beginPath();
    ctx.fillStyle = tool === "eraser" ? "#ffffff" : color;
    const w = SIZES[size] * (tool === "brush" ? 1.6 : tool === "pencil" ? 0.6 : 1.4);
    ctx.arc(p.x, p.y, w / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = ctxRef.current;
    if (!ctx || !last.current) return;
    const p = pos(e);
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = SIZES[size] * (tool === "brush" ? 1.6 : tool === "pencil" ? 0.6 : 1.4);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };

  const end = () => { drawing.current = false; last.current = null; };

  const undo = () => {
    const ctx = ctxRef.current;
    const img = undoStack.current.pop();
    if (ctx && img) ctx.putImageData(img, 0, 0);
  };

  const clear = () => { pushUndo(); fillWhite(); };

  const selectPage = (p: string | null) => {
    setActivePage(p);
    fillWhite();
    undoStack.current = [];
  };

  const save = () => {
    const paint = canvasRef.current;
    if (!paint) return;
    const out = document.createElement("canvas");
    out.width = CW; out.height = CH;
    const octx = out.getContext("2d")!;
    octx.drawImage(paint, 0, 0);
    const finish = () => {
      const url = out.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-kisss-coloring.png";
      a.click();
    };
    if (activePage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => { octx.drawImage(img, 0, 0, CW, CH); finish(); };
      img.onerror = finish;
      img.src = activePage;
    } else finish();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/70 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-full overflow-y-auto shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl">
          <h3 className="text-lg font-black text-slate-900">🎨 {T("Color & Create", "Colorea y Crea", "Colorie et Crée", "Colorir e Criar")}</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 font-bold hover:bg-slate-200">✕</button>
        </div>

        <div className="p-4 space-y-3">
          {/* page picker */}
          {pages.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button onClick={() => selectPage(null)} className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold border-2 ${!activePage ? "text-white" : "bg-white text-slate-700 border-slate-200"}`} style={!activePage ? { backgroundColor: accent, borderColor: accent } : {}}>
                {T("Blank", "En blanco", "Vierge", "Em branco")}
              </button>
              {pages.map((p, i) => (
                <button key={p} onClick={() => selectPage(p)} className={`shrink-0 w-12 h-14 rounded-xl border-2 overflow-hidden bg-white ${activePage === p ? "" : "border-slate-200"}`} style={activePage === p ? { borderColor: accent } : {}}>
                  <img src={p} alt={`page ${i + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* canvas + line-art overlay */}
          <div className="relative mx-auto rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ width: "100%", maxWidth: 460, aspectRatio: `${CW} / ${CH}` }}>
            <canvas
              ref={canvasRef}
              width={CW}
              height={CH}
              onPointerDown={start}
              onPointerMove={move}
              onPointerUp={end}
              onPointerLeave={end}
              className="absolute inset-0 w-full h-full touch-none"
              style={{ touchAction: "none" }}
            />
            {activePage && (
              <img src={activePage} alt="coloring page" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
            )}
          </div>

          {/* palette */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => { setColor(c); if (tool === "eraser") setTool("brush"); }}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c && tool !== "eraser" ? "scale-110 border-slate-900" : "border-white shadow"}`}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>

          {/* tools + sizes */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {([
              ["pencil", "✏️", T("Pencil", "Lápiz", "Crayon", "Lápis")],
              ["brush", "🖌️", T("Brush", "Pincel", "Pinceau", "Pincel")],
              ["eraser", "🧽", T("Eraser", "Borrador", "Gomme", "Borracha")],
            ] as [Tool, string, string][]).map(([tk, icon, label]) => (
              <button key={tk} onClick={() => setTool(tk)} className={`px-3 py-2 rounded-xl text-xs font-bold border-2 ${tool === tk ? "text-white" : "bg-white text-slate-700 border-slate-200"}`} style={tool === tk ? { backgroundColor: accent, borderColor: accent } : {}}>
                {icon} {label}
              </button>
            ))}
            <div className="flex items-center gap-1 ml-1">
              {(["S", "M", "L"] as SizeKey[]).map((s) => (
                <button key={s} onClick={() => setSize(s)} className={`w-9 h-9 rounded-xl text-xs font-black border-2 ${size === s ? "text-white" : "bg-white text-slate-700 border-slate-200"}`} style={size === s ? { backgroundColor: accent, borderColor: accent } : {}}>{s}</button>
              ))}
            </div>
          </div>

          {/* actions */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button onClick={undo} className="px-4 py-2 rounded-full text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200">↩︎ {T("Undo", "Deshacer", "Annuler", "Desfazer")}</button>
            <button onClick={clear} className="px-4 py-2 rounded-full text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200">🗑️ {T("Clear", "Borrar todo", "Effacer", "Limpar")}</button>
            <button onClick={save} className="px-5 py-2 rounded-full text-sm font-bold text-white shadow-md active:scale-95" style={{ backgroundColor: accent }}>💾 {T("Save to device", "Guardar", "Enregistrer", "Salvar")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
