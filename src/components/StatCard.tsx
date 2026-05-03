import { ReactNode } from 'react';
import { cn } from '@/src/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  className?: string;
  variant?: 'blue' | 'emerald' | 'amber' | 'red';
}

export default function StatCard({ title, value, icon, trend, className, variant = 'blue' }: StatCardProps) {
  const variants = {
    blue: 'bg-sky-50 text-sky-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className={cn("bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4", className)}>
      <div className="flex justify-between items-start">
        <div className={cn("p-3 rounded-2xl", variants[variant])}>
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</h3>
        <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
      </div>
    </div>
  );
}
