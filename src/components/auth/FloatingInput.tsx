import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

export const FloatingInput: React.FC<FloatingInputProps> = ({ label, icon, className, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

  useEffect(() => {
    setHasValue(!!props.value || !!props.defaultValue);
  }, [props.value, props.defaultValue]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(e.target.value !== '');
    if (props.onBlur) props.onBlur(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (props.onFocus) props.onFocus(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value !== '');
    if (props.onChange) props.onChange(e);
  };

  return (
    <div className="relative w-full group">
      <div className={cn(
        "absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-200 text-slate-400 group-focus-within:text-emerald-500",
        (isFocused || hasValue) && "opacity-0 invisible"
      )}>
        {icon}
      </div>
      <input
        {...props}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        className={cn(
          "w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-slate-900 outline-none transition-all duration-300",
          "focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10",
          "placeholder:transparent",
          icon && "pl-12",
          className
        )}
        placeholder={label}
      />
      <label
        className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none text-slate-500",
          icon && "left-12",
          (isFocused || hasValue) && cn(
            "top-0 -translate-y-1/2 scale-75 px-2 bg-white text-emerald-600 font-bold",
            icon && "left-4"
          )
        )}
      >
        {label}
      </label>
    </div>
  );
};
