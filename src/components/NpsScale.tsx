import { cn } from '@/src/lib/utils';

interface NpsScaleProps {
  value: number | null;
  onChange: (value: number) => void;
}

export default function NpsScale({ value, onChange }: NpsScaleProps) {
  const getColors = (num: number) => {
    if (num <= 6) return value === num ? "bg-red-500 text-white border-red-600" : "hover:border-red-300 hover:text-red-500";
    if (num <= 8) return value === num ? "bg-amber-400 text-white border-amber-500" : "hover:border-amber-200 hover:text-amber-500";
    return value === num ? "bg-emerald-500 text-white border-emerald-600" : "hover:border-emerald-200 hover:text-emerald-500";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-6 sm:grid-cols-11 gap-2">
        {Array.from({ length: 11 }, (_, i) => i).map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={cn(
              "h-12 w-full rounded-xl flex items-center justify-center font-bold text-lg border-2 transition-all shadow-sm",
              getColors(num),
              value === null ? "border-slate-200 text-slate-600 bg-white" : "",
              value !== num && value !== null ? "border-slate-100 text-slate-400 bg-slate-50" : ""
            )}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
        <span>Pouco Provável</span>
        <span>Muito Provável</span>
      </div>
    </div>
  );
}
