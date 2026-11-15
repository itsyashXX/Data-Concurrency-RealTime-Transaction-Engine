import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

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
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="relative group bg-white border border-slate-200/90 hover:border-indigo-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Top subtle highlight shimmer */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors">
          {title}
        </span>
        <div className="p-2.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all duration-200">
          <Icon className="w-4 h-4 transition-transform group-hover:scale-105" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
          {value}
        </div>
        {badge && (
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${badgeColors[badge.variant]} flex items-center gap-1 shadow-sm`}>
            {badge.variant === 'success' && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
              </span>
            )}
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="mt-3 text-xs text-slate-500 font-sans flex items-center justify-between pt-2.5 border-t border-slate-100">
          <span className="truncate">{subtitle}</span>
          {trend && (
            <span className="text-emerald-600 font-mono text-[11px] font-bold shrink-0 ml-2">
              {trend}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default MetricCard;
