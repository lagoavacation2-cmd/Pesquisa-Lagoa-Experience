import { Star } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface RatingScaleProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
}

export default function RatingScale({ label, value, onChange }: RatingScaleProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="flex items-center justify-between max-w-sm">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-200 group",
              value === num ? "scale-110" : "hover:scale-105"
            )}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-colors",
                value === num
                  ? "bg-sky-100 border-sky-500 text-sky-600 shadow-sm"
                  : "bg-white border-slate-200 text-slate-400 group-hover:border-sky-300 group-hover:text-sky-400"
              )}
            >
              <Star className={cn("w-6 h-6", value === num && "fill-current")} />
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
    </div>
  );
}
