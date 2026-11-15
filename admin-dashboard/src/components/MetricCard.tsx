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
    success: 'bg-aurora-mint/15 text-aurora-mint border-aurora-mint/30 shadow-neon-mint/20',
    warning: 'bg-aurora-gold/15 text-aurora-gold border-aurora-gold/30',
    danger: 'bg-aurora-pink/15 text-aurora-pink border-aurora-pink/30',
    info: 'bg-aurora-cyan/15 text-aurora-cyan border-aurora-cyan/30 shadow-neon-cyan/20',
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="relative group bg-void-900/85 border border-white/[0.08] hover:border-aurora-cyan/45 rounded-2xl p-5 shadow-lg hover:shadow-neon-cyan/20 transition-all duration-300 overflow-hidden backdrop-blur-xl"
    >
      {/* Top subtle highlight shimmer */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-aurora-cyan/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-300 transition-colors">
          {title}
        </span>
        <div className="p-2.5 rounded-xl bg-void-800 text-aurora-cyan border border-white/[0.08] group-hover:border-aurora-cyan/40 group-hover:bg-aurora-cyan/15 transition-all duration-300 shadow-sm">
          <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl font-black text-white tracking-tight font-mono">
          {value}
        </div>
        {badge && (
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${badgeColors[badge.variant]} flex items-center gap-1 shadow-sm`}>
            {badge.variant === 'success' && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aurora-mint opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-aurora-mint"></span>
              </span>
            )}
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="mt-2.5 text-xs text-slate-400 font-sans flex items-center justify-between pt-2 border-t border-white/[0.04]">
          <span className="truncate">{subtitle}</span>
          {trend && (
            <span className="text-aurora-mint font-mono text-[11px] font-bold shrink-0 ml-2">
              {trend}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default MetricCard;
