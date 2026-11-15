import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'danger' | 'info';
  };
  trend?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  trend
}) => {
  const badgeColors = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    info: 'bg-brand-500/15 text-brand-300 border-brand-500/30',
  };

  return (
    <div className="relative group bg-obsidian-900/80 border border-white/[0.07] hover:border-brand-500/40 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-glow-brand overflow-hidden">
      {/* Top subtle highlight glow */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className="p-2.5 rounded-xl bg-obsidian-850 text-brand-400 border border-white/[0.06] group-hover:border-brand-500/30 group-hover:bg-brand-500/10 transition-colors">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold text-white tracking-tight font-mono">
          {value}
        </div>
        {badge && (
          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${badgeColors[badge.variant]} flex items-center gap-1`}>
            {badge.variant === 'success' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2.5 text-xs text-slate-400 font-sans flex items-center justify-between">
          <span>{subtitle}</span>
          {trend && <span className="text-emerald-400 font-mono text-[11px] font-semibold">{trend}</span>}
        </p>
      )}
    </div>
  );
};

export default MetricCard;
