import { cn } from '@/lib/utils';

/**
 * Soft romantic dedication watermark.
 * Variants: banner (header), footer, corner, hero, inline
 * Low opacity by default for a delicate presence.
 */
export default function IdellaWatermark({
  variant = 'footer',
  className,
  'aria-hidden': ariaHidden = true,
}) {
  const isBanner = variant === 'banner';
  const isCompact = variant === 'banner' || variant === 'corner' || variant === 'inline';

  return (
    <div
      className={cn(
        'pointer-events-none select-none',
        variant === 'banner' && 'max-w-full opacity-[0.55]',
        variant === 'corner' && 'absolute bottom-2 right-2 max-w-[11rem] opacity-[0.38]',
        variant === 'footer' && 'relative mx-auto max-w-[16rem] opacity-[0.45] py-1',
        variant === 'hero' && 'relative mx-auto max-w-[18rem] opacity-[0.55]',
        variant === 'inline' && 'opacity-[0.4]',
        className
      )}
      aria-hidden={ariaHidden}
    >
      <div
        className={cn(
          'relative flex items-center justify-center',
          isBanner ? 'px-0 py-0' : 'px-3 py-2'
        )}
      >
        {/* Soft pink heart behind the text */}
        <svg
          viewBox="0 0 120 110"
          className={cn(
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-300/55',
            isCompact ? 'w-14 h-12' : 'w-24 h-20',
            variant === 'hero' && 'w-28 h-24 text-rose-300/45',
            isBanner && 'w-12 h-10 opacity-80'
          )}
          fill="currentColor"
          aria-hidden
        >
          <path d="M60 95C60 95 12 62 12 36C12 20 24 10 38 10C48 10 55 16 60 24C65 16 72 10 82 10C96 10 108 20 108 36C108 62 60 95 60 95Z" />
        </svg>
        <p
          className={cn(
            'idella-script relative z-10 text-center leading-snug text-rose-900/75',
            isCompact ? 'text-[0.65rem] sm:text-[0.7rem]' : 'text-sm',
            variant === 'hero' && 'text-base sm:text-lg',
            isBanner && 'whitespace-nowrap text-[0.62rem] sm:text-[0.68rem] tracking-wide'
          )}
        >
          {isBanner ? (
            <>For føden du gir mitt hjerte, min Idella</>
          ) : (
            <>
              For føden du gir mitt hjerte,
              <br />
              min Idella
            </>
          )}
        </p>
      </div>
    </div>
  );
}
