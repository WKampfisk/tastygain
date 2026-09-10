import { cn } from '@/lib/utils';

/** TastyGain brand mark — cocoa cake / candy */
export default function AppLogo({ className, size = 36, alt = 'TastyGain' }) {
  return (
    <img
      src="/brand/logo.jpg"
      alt={alt}
      width={size}
      height={size}
      className={cn(
        'rounded-xl object-cover shadow-sm shrink-0 bg-white ring-1 ring-black/5',
        className
      )}
      draggable={false}
    />
  );
}
