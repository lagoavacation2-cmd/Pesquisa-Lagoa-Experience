import { cn } from '@/src/lib/utils';
import { useRef, useEffect } from 'react';

interface NpsScaleProps {
  value: number | null;
  onChange: (value: number) => void;
  id?: string;
  error?: string;
  required?: boolean;
}

export default function NpsScale({ value, onChange, id, error, required }: NpsScaleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Somente no mobile
    const isMobile = window.innerWidth <= 768;
    if (isMobile && scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
      }, 300); // Um pouco mais de tempo para garantir o render
    }
  }, []);

  const getColors = (num: number) => {
    if (num <= 6) return value === num ? "bg-red-500 text-white border-red-600" : "hover:border-red-300 hover:text-red-500";
    if (num <= 8) return value === num ? "bg-amber-400 text-white border-amber-500" : "hover:border-amber-200 hover:text-amber-500";
    return value === num ? "bg-emerald-500 text-white border-emerald-600" : "hover:border-emerald-200 hover:text-emerald-500";
  };

  return (
    <div id={id} className={cn("flex flex-col gap-4 p-4 rounded-3xl transition-all", error && "bg-red-50/50 ring-1 ring-red-200")}>
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto sm:grid sm:grid-cols-11 gap-2 pb-2 sm:pb-0 hide-scrollbar scroll-smooth"
      >
        {Array.from({ length: 11 }, (_, i) => i).map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={cn(
              "h-12 min-w-[3rem] sm:min-w-0 w-full rounded-xl flex items-center justify-center font-bold text-lg border-2 transition-all shadow-sm flex-shrink-0 sm:flex-shrink",
              getColors(num),
              value === null ? cn("border-slate-200 text-slate-600 bg-white", error && "border-red-200") : "",
              value !== num && value !== null ? "border-slate-100 text-slate-400 bg-slate-50" : ""
            )}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
        <span>Pouco Provável</span>
        <span className="sm:hidden block italic text-sky-500">Arraste para o lado</span>
        <span>Muito Provável</span>
      </div>
      {error && <span className="text-xs font-bold text-red-500 uppercase tracking-wide">{error}</span>}
    </div>
  );
}
