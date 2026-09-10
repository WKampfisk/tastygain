import { Image } from '@/components/ui/image';
import { recipeDisplayName, recipeImageAlt } from '@/lib/i18n/recipeDisplay';
import { cn } from '@/lib/utils';
import { ThumbsDown, ThumbsUp } from 'lucide-react';

export default function MealCard({
  recipe,
  locale = 'nb',
  discreet = false,
  preference,
  onAddSession,
  onPrepOnly,
  onLike,
  onDislike,
  className,
  t,
  showProtein = true,
}) {
  if (!recipe) return null;
  const title = recipeDisplayName(recipe, locale);
  const alt = recipeImageAlt(recipe, locale);
  const minutes = (recipe.prep_minutes || 0) + (recipe.cook_minutes || 0);
  const liked = preference === 'liked';
  const disliked = preference === 'disliked';

  return (
    <article
      className={cn(
        'rounded-2xl overflow-hidden border border-nc-border bg-nc-card shadow-sm',
        disliked && 'opacity-50',
        className
      )}
    >
      <div className="relative aspect-[4/3] bg-nc-beige overflow-hidden">
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={alt}
            fittingType="fill"
            className={cn(
              '!block w-full h-full absolute inset-0',
              discreet && 'grayscale-[30%]'
            )}
            originWidth={900}
            originHeight={675}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl bg-gradient-to-br from-emerald-100 to-lime-50">
            {recipe.icon || '🍽️'}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <h3 className="font-semibold text-base leading-tight drop-shadow">{title}</h3>
          <p className="text-[11px] text-white/90 mt-0.5">
            {minutes ? `${minutes} min` : ''}
            {recipe.portion_size_label ? ` · ${recipe.portion_size_label}` : ''}
            {showProtein && recipe.protein_g ? ` · ${Math.round(recipe.protein_g)} g ${t ? t('protein') : 'protein'}` : ''}
          </p>
        </div>
      </div>
      <div className="p-3 space-y-2">
        {recipe.description && (
          <p className="text-xs text-nc-muted line-clamp-2">{recipe.description}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {(onLike || onDislike) && (
            <>
              <button
                type="button"
                onClick={() => onLike?.(recipe)}
                className={cn(
                  'min-h-[40px] px-3 rounded-full text-xs font-medium border inline-flex items-center gap-1',
                  liked
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'border-nc-border text-nc-ink-soft'
                )}
                aria-label={locale === 'en' ? `Like ${title}` : `Lik ${title}`}
                aria-pressed={liked}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                {locale === 'en' ? 'Like' : 'Lik'}
              </button>
              <button
                type="button"
                onClick={() => onDislike?.(recipe)}
                className={cn(
                  'min-h-[40px] px-3 rounded-full text-xs font-medium border inline-flex items-center gap-1',
                  disliked
                    ? 'bg-stone-600 text-white border-stone-600'
                    : 'border-nc-border text-nc-ink-soft'
                )}
                aria-label={locale === 'en' ? `Dislike ${title}` : `Mislik ${title}`}
                aria-pressed={disliked}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                {locale === 'en' ? 'Dislike' : 'Mislik'}
              </button>
            </>
          )}
          {onAddSession && (
            <button
              type="button"
              onClick={() => onAddSession(recipe)}
              className="min-h-[40px] px-3 rounded-full text-xs font-medium bg-nc-green text-white hover:bg-nc-green-dark"
            >
              {t ? t('meals.addSession') : 'Add'}
            </button>
          )}
          {onPrepOnly && (
            <button
              type="button"
              onClick={() => onPrepOnly(recipe)}
              className="min-h-[40px] px-3 rounded-full text-xs font-medium border border-nc-border text-nc-ink-soft"
            >
              {t ? t('plan.prepOnlyThis') : 'Prep'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
