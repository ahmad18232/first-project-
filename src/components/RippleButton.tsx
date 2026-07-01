import React, { useState, useId } from 'react';
import { RippleData } from '../types';

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'clay' | 'danger' | 'success' | 'text';
  clayColor?: 'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'slate';
  fullWidth?: boolean;
}

export const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  variant = 'primary',
  clayColor = 'blue',
  fullWidth = false,
  className = '',
  onClick,
  ...props
}) => {
  const [ripples, setRipples] = useState<RippleData[]>([]);
  const buttonId = useId();

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple: RippleData = {
      id: Date.now() + Math.random(),
      x,
      y,
      size,
    };

    setRipples((prev) => [...prev, newRipple]);
  };

  const handleRippleEnd = (id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        // Material styled high-contrast primary
        return 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-98 shadow-md hover:shadow-lg transition-all duration-200';
      case 'secondary':
        return 'bg-white/70 text-slate-800 hover:bg-white active:scale-98 shadow-sm transition-all duration-200 border border-white/40';
      case 'danger':
        return 'bg-rose-500 text-white hover:bg-rose-600 active:scale-98 shadow-md transition-all duration-200';
      case 'success':
        return 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-98 shadow-md transition-all duration-200';
      case 'text':
        return 'bg-transparent text-indigo-600 hover:bg-indigo-50/50 active:scale-98 transition-all duration-200';
      case 'clay':
        // Gorgeous Claymorphism classes
        const colorMaps = {
          blue: 'bg-blue-100 border border-blue-200 text-blue-800 shadow-[4px_4px_12px_rgba(147,197,253,0.3),_inset_3px_3px_6px_rgba(255,255,255,0.9),_inset_-3px_-3px_6px_rgba(147,197,253,0.4)] hover:shadow-[6px_6px_16px_rgba(147,197,253,0.4),_inset_4px_4px_8px_rgba(255,255,255,0.95),_inset_-4px_-4px_8px_rgba(147,197,253,0.5)] active:scale-95',
          violet: 'bg-violet-100 border border-violet-200 text-violet-800 shadow-[4px_4px_12px_rgba(196,181,253,0.3),_inset_3px_3px_6px_rgba(255,255,255,0.9),_inset_-3px_-3px_6px_rgba(196,181,253,0.4)] hover:shadow-[6px_6px_16px_rgba(196,181,253,0.4),_inset_4px_4px_8px_rgba(255,255,255,0.95),_inset_-4px_-4px_8px_rgba(196,181,253,0.5)] active:scale-95',
          emerald: 'bg-emerald-100 border border-emerald-200 text-emerald-800 shadow-[4px_4px_12px_rgba(110,231,183,0.3),_inset_3px_3px_6px_rgba(255,255,255,0.9),_inset_-3px_-3px_6px_rgba(110,231,183,0.4)] hover:shadow-[6px_6px_16px_rgba(110,231,183,0.4),_inset_4px_4px_8px_rgba(255,255,255,0.95),_inset_-4px_-4px_8px_rgba(110,231,183,0.5)] active:scale-95',
          amber: 'bg-amber-100 border border-amber-200 text-amber-800 shadow-[4px_4px_12px_rgba(252,211,77,0.3),_inset_3px_3px_6px_rgba(255,255,255,0.9),_inset_-3px_-3px_6px_rgba(252,211,77,0.4)] hover:shadow-[6px_6px_16px_rgba(252,211,77,0.4),_inset_4px_4px_8px_rgba(255,255,255,0.95),_inset_-4px_-4px_8px_rgba(252,211,77,0.5)] active:scale-95',
          rose: 'bg-rose-100 border border-rose-200 text-rose-800 shadow-[4px_4px_12px_rgba(244,114,182,0.3),_inset_3px_3px_6px_rgba(255,255,255,0.9),_inset_-3px_-3px_6px_rgba(244,114,182,0.4)] hover:shadow-[6px_6px_16px_rgba(244,114,182,0.4),_inset_4px_4px_8px_rgba(255,255,255,0.95),_inset_-4px_-4px_8px_rgba(244,114,182,0.5)] active:scale-95',
          slate: 'bg-slate-100 border border-slate-200 text-slate-800 shadow-[4px_4px_12px_rgba(148,163,184,0.15),_inset_3px_3px_6px_rgba(255,255,255,0.9),_inset_-3px_-3px_6px_rgba(148,163,184,0.2)] hover:shadow-[6px_6px_16px_rgba(148,163,184,0.25),_inset_4px_4px_8px_rgba(255,255,255,0.95),_inset_-4px_-4px_8px_rgba(148,163,184,0.3)] active:scale-95',
        };
        return colorMaps[clayColor] + ' transition-all duration-300';
    }
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      id={buttonId}
      onPointerDown={handlePointerDown}
      onClick={handleButtonClick}
      className={`relative overflow-hidden inline-flex items-center justify-center font-medium px-5 py-2.5 rounded-2xl select-none outline-none ${
        fullWidth ? 'w-full' : ''
      } ${getVariantClasses()} ${className}`}
      {...props}
    >
      <span className="relative z-10 pointer-events-none flex items-center justify-center gap-2">
        {children}
      </span>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute bg-current opacity-25 rounded-full pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
          onAnimationEnd={() => handleRippleEnd(ripple.id)}
        />
      ))}
    </button>
  );
};
