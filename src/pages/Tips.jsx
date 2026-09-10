import { Card, SectionTitle } from '@/components/ui/Card';
import { useStore } from '@/lib/store';

export default function Tips() {
  const { t } = useStore();
  const cards = [
    { t: t('tips.proteinSweetsTitle'), b: t('tips.proteinSweets') },
    { t: t('tips.saltySweetTitle'), b: t('tips.saltySweet') },
    { t: t('tips.sixSmallTitle'), b: t('tips.sixSmall') },
    { t: t('tips.freezerTitle'), b: t('tips.freezer') },
    { t: t('tips.trainingTitle'), b: t('tips.training') },
    { t: t('tips.helpTitle'), b: t('tips.help') },
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-nc-peach/30 border-nc-peach">
        <p className="text-sm leading-relaxed">{t('disclaimer')}</p>
      </Card>

      <SectionTitle>{t('tips.title')}</SectionTitle>
      <div className="space-y-2">
        {cards.map((g) => (
          <Card key={g.t}>
            <h3 className="font-semibold text-sm">{g.t}</h3>
            <p className="text-sm text-nc-ink-soft mt-1">{g.b}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
