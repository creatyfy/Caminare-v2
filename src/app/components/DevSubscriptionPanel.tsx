import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { devSetSubscription } from '../lib/db';
import { useEntitlement, setDevOverride } from '../contexts/EntitlementContext';

// Painel de TESTE (só admin) — Fase 1 sem IAP. Força os estados de assinatura no
// próprio usuário admin pra validar trial/expirado/planos e o gating no navegador.
// O "override" (simular contagem de registros) fica no localStorage — não toca no
// schema do cliente. Strings em PT (ferramenta interna).
function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

type Preset = {
  label: string;
  params: Parameters<typeof devSetSubscription>[0];
  override: number | null;
};

const PRESETS: Preset[] = [
  { label: 'Trial ativo (15d)', params: { status: 'trial', plan: null, tier: null, trialEndsAt: daysFromNow(15) }, override: null },
  { label: 'Trial dia 7 (8d restantes)', params: { status: 'trial', plan: null, tier: null, trialEndsAt: daysFromNow(8) }, override: null },
  { label: 'Trial dia 14 (1d restante)', params: { status: 'trial', plan: null, tier: null, trialEndsAt: daysFromNow(1) }, override: null },
  { label: 'Trial expirado (dias)', params: { status: 'trial', plan: null, tier: null, trialEndsAt: daysFromNow(-1) }, override: null },
  { label: 'Trial expirado (75 reg.)', params: { status: 'trial', plan: null, tier: null, trialEndsAt: daysFromNow(15) }, override: 75 },
  { label: 'Assinante Básico (150)', params: { status: 'active', plan: 'monthly', tier: 'basico', periodEnd: daysFromNow(30) }, override: null },
  { label: 'Assinante Avançado (250)', params: { status: 'active', plan: 'monthly', tier: 'avancado', periodEnd: daysFromNow(30) }, override: null },
  { label: 'Básico no teto (150)', params: { status: 'active', plan: 'monthly', tier: 'basico', periodEnd: daysFromNow(30) }, override: 150 },
  { label: 'Assinatura expirada', params: { status: 'expired', plan: null, tier: null }, override: null },
];

export function DevSubscriptionPanel() {
  const ent = useEntitlement();
  const [busy, setBusy] = useState(false);

  async function apply(preset: Preset) {
    setBusy(true);
    setDevOverride(preset.override);
    // Limpa a marcação de "já dispensei" dos avisos de trial p/ poder re-disparar
    // os modais de dia 7 / dia 14 ao testar.
    try {
      window.localStorage.removeItem('cam_trial_notice_day7');
      window.localStorage.removeItem('cam_trial_notice_day14');
    } catch {
      // ignore
    }
    const { error } = await devSetSubscription(preset.params);
    if (error) console.error('[DevSubscriptionPanel]', error);
    await ent.refresh();
    setBusy(false);
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--cam-bg-card)',
        borderRadius: '20px',
        padding: '20px',
        boxShadow: 'var(--cam-shadow-card)',
        border: '1px dashed var(--cam-color-brand)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <FlaskConical size={16} color="var(--cam-text-brand)" />
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cam-text-primary)' }}>
          Teste de assinatura (admin)
        </span>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--cam-text-secondary)', margin: '0 0 12px 0', lineHeight: 1.4 }}>
        Estado:{' '}
        <strong style={{ color: 'var(--cam-text-primary)' }}>
          {ent.loading ? '...' : `${ent.status}${ent.tier ? `/${ent.tier}` : ''}`}
        </strong>{' '}
        · acesso <strong style={{ color: 'var(--cam-text-primary)' }}>{ent.access}</strong> · uso{' '}
        <strong style={{ color: 'var(--cam-text-primary)' }}>
          {ent.used}/{ent.limit}
        </strong>
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            disabled={busy}
            onClick={() => void apply(p)}
            style={{
              padding: '8px 12px',
              borderRadius: '9999px',
              backgroundColor: 'var(--cam-bg-tint)',
              color: 'var(--cam-text-brand)',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: busy ? 'wait' : 'pointer',
              fontFamily: 'inherit',
              opacity: busy ? 0.6 : 1,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
