import { Star } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useRef, useEffect } from 'react';

interface RatingScaleProps {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  required?: boolean;
  error?: string;
  id?: string;
}

export default function RatingScale({ label, value, onChange, required, error, id }: RatingScaleProps) {
  return (
    <div id={id} className={cn("flex flex-col gap-3 p-4 rounded-2xl transition-all", error && "bg-red-50/50 ring-1 ring-red-200")}>
      <label className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="grid grid-cols-6 sm:flex sm:flex-wrap gap-x-2 gap-y-4">
        {[0, 1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-200 group",
              value === num ? "scale-105" : "hover:scale-105"
            )}
          >
            <div
              className={cn(
                "w-full aspect-square sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border-2 transition-colors",
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
