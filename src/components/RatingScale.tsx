import { Star } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useRef, useEffect } from 'react';

interface RatingScaleProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
  error?: string;
  id?: string;
}

export default function RatingScale({ label, value, onChange, required, error, id }: RatingScaleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Somente no mobile
    const isMobile = window.innerWidth <= 768;
    if (isMobile && scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
      }, 300);
    }
  }, []);

  return (
    <div id={id} className={cn("flex flex-col gap-3 p-4 rounded-2xl transition-all", error && "bg-red-50/50 ring-1 ring-red-200")}>
      <label className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div 
        ref={scrollRef}
        className="flex items-center justify-between gap-2 overflow-x-auto pb-2 sm:overflow-visible sm:justify-start sm:flex-wrap hide-scrollbar scroll-smooth"
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-200 group flex-shrink-0",
              value === num ? "scale-110" : "hover:scale-105"
            )}
          >
            <div
              className={cn(
                "w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border-2 transition-colors",
                value === num
                  ? "bg-sky-100 border-sky-500 text-sky-600 shadow-sm"
                  : cn("bg-white border-slate-200 text-slate-400 group-hover:border-sky-300 group-hover:text-sky-400", error && "border-red-200")
              )}
            >
              <Star className={cn("w-4 h-4 sm:w-5 sm:h-5", value === num && "fill-current")} />
            </div>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              value === num ? "text-sky-600" : "text-slate-400"
            )}>
              {num}
            </span>
          </button>
        ))}
      </div>
      {error && <span className="text-xs font-bold text-red-500 uppercase tracking-wide">{error}</span>}
    </div>
  );
}
