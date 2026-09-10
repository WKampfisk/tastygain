import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'bg-nc-card rounded-2xl border border-nc-border shadow-sm p-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between mb-3 mt-1">
      <h2 className="text-base font-semibold text-nc-ink">{children}</h2>
      {action}
    </div>
  );
}

export function Pill({ children, tone = 'default', className }) {
  const tones = {
    default: 'bg-nc-beige text-nc-ink-soft',
    green: 'bg-nc-green/15 text-nc-green-dark',
    blue: 'bg-nc-blue/20 text-nc-blue-dark',
    peach: 'bg-nc-peach/50 text-nc-ink-soft',
    warn: 'bg-amber-50 text-amber-900',
  };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', tones[tone], className)}>
      {children}
    </span>
  );
}

export function BigButton({ children, onClick, variant = 'primary', className, ...props }) {
  const variants = {
    primary: 'bg-nc-green text-white hover:bg-nc-green-dark',
    secondary: 'bg-nc-card border border-nc-border text-nc-ink hover:bg-nc-beige',
    soft: 'bg-nc-blue/20 text-nc-blue-dark hover:bg-nc-blue/30',
    peach: 'bg-nc-peach/60 text-nc-ink hover:bg-nc-peach',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'min-h-[48px] px-4 rounded-2xl text-sm font-semibold transition-colors active:scale-[0.98]',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
