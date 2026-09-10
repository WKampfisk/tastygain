import { forwardRef } from 'react';

const Input = forwardRef(({ className = '', ...props }, ref) => (
  <input
    ref={ref}
    className={`flex min-h-[44px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-base shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
));

Input.displayName = 'Input';

export { Input };
