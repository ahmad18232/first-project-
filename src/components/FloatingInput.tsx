import React, { useState, useId } from 'react';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
  onClear?: () => void;
  icon?: React.ReactNode;
}

export const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  helperText,
  error,
  onClear,
  icon,
  className = '',
  value,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = useId();

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const hasValue = value !== undefined && value !== null && value !== '';

  return (
    <div className={`w-full flex flex-col mb-4 ${className}`}>
      <div className="relative w-full">
        {/* Input field wrapper with soft clay border */}
        <div
          className={`flex items-center w-full px-4 pt-5 pb-1.5 rounded-2xl border-2 bg-slate-50/50 dark:bg-[#161824] transition-all duration-200 ${
            error
              ? 'border-rose-400 focus-within:border-rose-500 focus-within:ring-1 focus-within:ring-rose-200 dark:focus-within:ring-rose-950'
              : isFocused
              ? 'border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-200 dark:focus-within:ring-indigo-950'
              : 'border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
          } shadow-[inset_1px_1px_3px_rgba(0,0,0,0.03)]`}
        >
          {icon && <div className="mr-2 text-slate-400 dark:text-slate-500 pointer-events-none mt-3">{icon}</div>}
          
          <input
            id={inputId}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="w-full bg-transparent border-none p-0 outline-none text-slate-800 dark:text-slate-100 text-sm font-medium h-6 mt-1 placeholder-transparent focus:ring-0"
            {...props}
          />

          {/* Floating Label */}
          <label
            htmlFor={inputId}
            className={`absolute left-4 transition-all duration-200 pointer-events-none select-none text-sm font-semibold origin-top-left ${
              icon ? 'translate-x-6' : ''
            } ${
              isFocused || hasValue
                ? 'translate-y-[-12px] scale-75 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'translate-y-[4px] text-slate-400 dark:text-slate-500'
            } ${error && !isFocused ? 'text-rose-400' : ''}`}
          >
            {label}
          </label>

          {/* Clear button if value is present and onClear is provided */}
          {hasValue && onClear && (
            <button
              type="button"
              id={`${inputId}-clear`}
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Helper text / error message */}
      {error ? (
        <span className="text-xs text-rose-500 font-semibold mt-1.5 ml-2 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-rose-500"></span>
          {error}
        </span>
      ) : helperText ? (
        <span className="text-xs text-slate-400 mt-1.5 ml-2 flex items-center gap-1 font-medium">
          <span className="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
          {helperText}
        </span>
      ) : null}
    </div>
  );
};
