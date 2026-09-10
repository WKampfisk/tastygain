import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, SectionTitle, BigButton } from '@/components/ui/Card';
import { CONSENT_LABELS, COPY } from '@/lib/copy';
import { formatDateEU } from '@/lib/utils';
import { AlertTriangle, FileText, Phone } from 'lucide-react';

export default function Support() {
  const { state } = useStore();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [emergency, setEmergency] = useState(false);

  const summary = useMemo(() => {
    const logs = state.logs || [];
    const accepted = logs.filter((l) =>
      ['ate_all', 'ate_some', 'drank_all', 'drank_some'].includes(l.status)
    );
    const skipped = logs.filter((l) =>
      ['skipped_without_pressure', 'did_not_feel_manageable'].includes(l.status)
    );
    const foods = {};
    accepted.forEach((l) => {
      foods[l.meal_name] = (foods[l.meal_name] || 0) + 1;
    });
    const common = Object.entries(foods)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([n]) => n);
    return {
      events: logs.length,
      accepted: accepted.length,
      gentleSkips: skipped.length,
      common,
      notes: logs.map((l) => l.notes).filter(Boolean).slice(0, 5),
    };
  }, [state.logs]);

  const consent =
    CONSENT_LABELS[state.household?.consent_mode] || state.household?.consent_mode || '—';

  return (
    <div className="space-y-4">
      <Card className="bg-nc-peach/30 border-nc-peach">
        <p className="text-sm leading-relaxed">{COPY.disclaimer}</p>
      </Card>

      <SectionTitle>Veiledning</SectionTitle>
      <div className="space-y-2">
        {[
          {
            t: 'Tilby uten press',
            b: 'Presenter mat som tilgjengelig. «Noe lite er nok.» Aldri ram inn spising som en test eller et mål.',
          },
          {
            t: 'Unngå kontrollerende adferd',
            b: 'Den som mottar støtte beholder kontrollen. Loggføring er valgfri og aldri skamfull. «Hoppet over uten press» er alltid gyldig.',
          },
          {
            t: 'Traumer og appetitt',
            b: 'Traumer kan påvirke sultsignaler, lukttoleranse og trygghet rundt måltider. Hold miljøet rolig og forutsigbart.',
          },
          {
            t: 'Forberedelse til lege',
            b: 'Bruk sammendragseksport bare med samtykke. Ikke inkluder automatisk vekt, kalorier eller traumenotater.',
          },
        ].map((g) => (
          <Card key={g.t}>
            <h3 className="font-semibold text-sm">{g.t}</h3>
            <p className="text-sm text-nc-ink-soft mt-1">{g.b}</p>
          </Card>
        ))}
      </div>

      <SectionTitle>Påminnelser</SectionTitle>
      <div className="space-y-2">
        {(state.reminders || []).map((r) => (
          <Card key={r.id} className="py-3">
            <p className="text-sm font-medium">{r.message}</p>
            <p className="text-xs text-nc-muted mt-1">
              {formatDateEU(r.date)} {r.time || ''}
              {r.discreet_mode ? ' · diskré tekst' : ''}
            </p>
          </Card>
        ))}
      </div>

      <BigButton
        variant="primary"
        className="w-full flex items-center justify-center gap-2"
        onClick={() => setSummaryOpen(true)}
      >
        <FileText className="w-4 h-4" /> Sammendrag til lege / klinisk ernæringsfysiolog
      </BigButton>

      <BigButton
        variant="peach"
        className="w-full flex items-center justify-center gap-2"
        onClick={() => setEmergency(true)}
      >
        <Phone className="w-4 h-4" /> Akutt og krisestøtte
      </BigButton>

      {summaryOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-end p-4">
          <Card className="w-full max-w-md max-h-[85vh] overflow-y-auto space-y-3">
            <h2 className="text-lg font-semibold">Sammendrag til time</h2>
            <p className="text-xs text-nc-muted">
              Samtykkemodus: {consent}. Private notater og traumeopplysninger er utelatt.
            </p>
            <ul className="text-sm space-y-2">
              <li>Loggførte måltidshendelser (periode): {summary.events}</li>
              <li>Akseptert / delvis akseptert: {summary.accepted}</li>
              <li>Hoppet over uten press / ikke overkommelig: {summary.gentleSkips}</li>
              <li>Mat som ofte aksepteres: {summary.common.join(', ') || '—'}</li>
            </ul>
            {summary.notes.length > 0 && (
              <div>
                <p className="text-xs font-medium text-nc-muted mb-1">Støttende observasjoner</p>
                {summary.notes.map((n, i) => (
                  <p key={i} className="text-sm text-nc-ink-soft">
                    «{n}»
                  </p>
                ))}
              </div>
            )}
            <p className="text-xs text-nc-muted">
              Mulige spørsmål: appetittmønstre, kvalme, teksturpreferanser, flytende kontra fast,
              når man bør søke akutt hjelp.
            </p>
            <BigButton
              variant="primary"
              className="w-full"
              onClick={() => {
                const text = `Idellicious-sammendrag\nHendelser: ${summary.events}\nAkseptert: ${summary.accepted}\nRolige hopp: ${summary.gentleSkips}\nMat: ${summary.common.join(', ')}\nNotater: ${summary.notes.join('; ')}`;
                navigator.clipboard?.writeText(text);
              }}
            >
              Kopier som ren tekst
            </BigButton>
            <BigButton variant="secondary" className="w-full" onClick={() => setSummaryOpen(false)}>
              {COPY.close}
            </BigButton>
          </Card>
        </div>
      )}

      {emergency && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end p-4">
          <Card className="w-full max-w-md space-y-3">
            <div className="flex items-center gap-2 text-nc-ink">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Akutt støtte</h2>
            </div>
            <p className="text-sm">
              Ved umiddelbar fare, ring nødetatene. I Norge:{' '}
              <strong>113</strong> (medisinsk) · <strong>112</strong> (politi).
            </p>
            <ul className="text-sm space-y-2">
              <li>
                <strong>Psykisk helse / krise:</strong> lokal akuttpsykiatri eller legevakt.
              </li>
              <li>
                <strong>Vold i nære relasjoner:</strong> krisesenter — søk «krisesenter» + din
                kommune; nasjonale ressurser via{' '}
                <a
                  className="text-nc-green underline"
                  href="https://www.krisesenter.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  krisesenter.com
                </a>
                .
              </li>
              <li>
                <strong>Alarmtelefonen for barn og unge:</strong> 116 111
              </li>
            </ul>
            <p className="text-xs text-nc-muted">{COPY.disclaimer}</p>
            <BigButton variant="secondary" className="w-full" onClick={() => setEmergency(false)}>
              {COPY.close}
            </BigButton>
          </Card>
        </div>
      )}
    </div>
  );
}
