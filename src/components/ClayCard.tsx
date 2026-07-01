import React, { useId } from 'react';

interface ClayCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  clayColor?: 'white' | 'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'slate';
  elevation?: 'low' | 'medium' | 'high';
  bordered?: boolean;
}

export const ClayCard: React.FC<ClayCardProps> = ({
  children,
  clayColor = 'white',
  elevation = 'medium',
  bordered = true,
  className = '',
  ...props
}) => {
  const cardId = useId();

  const getColorClasses = () => {
    switch (clayColor) {
      case 'white':
        return 'bg-white dark:bg-[#1F2232] border-white/40 dark:border-white/5 text-slate-800 dark:text-slate-100 shadow-[20px_20px_60px_#d1d9e6,_-20px_-20px_60px_#ffffff] dark:shadow-[20px_20px_60px_#131520,_-10px_-10px_40px_#2B2F44] rounded-[40px]';
      case 'blue':
        return 'bg-indigo-50/90 dark:bg-indigo-950/20 border-indigo-100/60 dark:border-indigo-900/40 text-indigo-950 dark:text-indigo-200 shadow-[20px_20px_60px_#d1d9e6,_-20px_-20px_60px_#ffffff] dark:shadow-[20px_20px_60px_#131520,_-10px_-10px_40px_#2B2F44] rounded-[40px]';
      case 'violet':
        return 'bg-violet-50/90 dark:bg-violet-950/20 border-violet-100/60 dark:border-violet-900/40 text-violet-950 dark:text-violet-200 shadow-[20px_20px_60px_#d1d9e6,_-20px_-20px_60px_#ffffff] dark:shadow-[20px_20px_60px_#131520,_-10px_-10px_40px_#2B2F44] rounded-[40px]';
      case 'emerald':
        return 'bg-emerald-50/90 dark:bg-emerald-950/20 border-emerald-100/60 dark:border-emerald-900/40 text-emerald-950 dark:text-emerald-200 shadow-[20px_20px_60px_#d1d9e6,_-20px_-20px_60px_#ffffff] dark:shadow-[20px_20px_60px_#131520,_-10px_-10px_40px_#2B2F44] rounded-[40px]';
      case 'amber':
        return 'bg-amber-50/95 dark:bg-amber-950/20 border-amber-100/60 dark:border-amber-900/40 text-amber-950 dark:text-amber-200 shadow-[20px_20px_60px_#d1d9e6,_-20px_-20px_60px_#ffffff] dark:shadow-[20px_20px_60px_#131520,_-10px_-10px_40px_#2B2F44] rounded-[40px]';
      case 'rose':
        return 'bg-rose-50/90 dark:bg-rose-950/20 border-rose-100/60 dark:border-rose-900/40 text-rose-950 dark:text-rose-200 shadow-[20px_20px_60px_#d1d9e6,_-20px_-20px_60px_#ffffff] dark:shadow-[20px_20px_60px_#131520,_-10px_-10px_40px_#2B2F44] rounded-[40px]';
      case 'slate':
        return 'bg-slate-50/90 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/40 text-slate-950 dark:text-slate-200 shadow-[20px_20px_60px_#d1d9e6,_-20px_-20px_60px_#ffffff] dark:shadow-[20px_20px_60px_#131520,_-10px_-10px_40px_#2B2F44] rounded-[40px]';
    }
  };

  const getElevationClasses = () => {
    switch (elevation) {
      case 'low':
        return 'hover:translate-y-[-1px] transition-all duration-300';
      case 'medium':
        return 'hover:translate-y-[-4px] hover:shadow-[12px_12px_28px_rgba(0,0,0,0.06)] transition-all duration-300';
      case 'high':
        return 'hover:translate-y-[-8px] hover:shadow-[16px_16px_36px_rgba(0,0,0,0.08)] transition-all duration-300';
    }
  };

  return (
    <div
      id={cardId}
      className={`rounded-[40px] p-6 ${bordered ? 'border-2' : 'border-none'} ${getColorClasses()} ${getElevationClasses()} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
