import { useState } from 'react';
import { ArrowLeft, Check, Lock, Sparkles, RotateCcw, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useEntitlement } from '../contexts/EntitlementContext';
import { useIap } from '../lib/useIap';
import { productIdFor } from '../lib/iap';
import { isIOS, isAndroid } from '../lib/native';
import {
  PLANS,
  PLAN_ORDER,
  POST_TRIAL_OFFER,
  formatBRL,
  type Cadence,
  type TierPricing,
} from '../lib/pricing';

// Tela de planos / paywall (Fase B — IAP ligado).
// Servida em /assinatura. Atende dois cenários:
//  • Usuário restrito (trial encerrado por dias/75, ou assinatura inativa) é
//    redirecionado pra cá pelo gating → mostra a mensagem de "teste encerrado".
//  • Usuário em trial chega via "Ver planos" no Perfil → vitrine de venda.
// Preço: no app nativo vem JÁ LOCALIZADO do offering da loja (useIap); no web
// (sem loja) cai no fallback de pricing.ts. "Assinar"/"Restaurar" usam o IAP real.
export function PaywallScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { status, access, refresh } = useEntitlement();
  const iap = useIap();

  // Anual é o destaque (desconto) → cadência padrão.
  const [cadence, setCadence] = useState<Cadence>('annual');
  const [busyProduct, setBusyProduct] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'error' | 'success'; msg: string } | null>(null);

  // "Primeiro acesso": enquanto o trial está ATIVO (nunca assinou) a promo de 1º
  // acesso (anual, 25% off) está disponível NO FALLBACK web. No app nativo o
  // offering da loja decide o preço, então a promo não se aplica.
  const firstAccess = status === 'trial' && access === 'full' && !iap.available;

  const restrictedTrial = access === 'restricted' && status === 'trial';
  const restrictedOther = access === 'restricted' && status !== 'trial';

  let title = t('plans.salesTitle');
  let subtitle = t('plans.salesSubtitle');
  if (restrictedTrial) {
    title = t('plans.trialDoneTitle');
    subtitle = t('plans.trialDoneSubtitle', {
      monthly: formatBRL(POST_TRIAL_OFFER.monthlyBRL),
      annual: formatBRL(POST_TRIAL_OFFER.annualBRL),
      pct: POST_TRIAL_OFFER.discountPct,
    });
  } else if (restrictedOther) {
    title = t('plans.restrictedTitle');
    subtitle = t('plans.restrictedSubtitle');
  }

  async function handleSubscribe(tier: TierPricing['tier']) {
    if (busyProduct) return;
    setFeedback(null);
    const productId = productIdFor(tier, cadence);
    setBusyProduct(productId);
    try {
      const r = await iap.purchase(tier, cadence);
      if (r === 'cancelled') return; // usuário fechou o pagamento — sem aviso
      await refresh();
      navigate('/home', { replace: true });
    } catch {
      setFeedback({ kind: 'error', msg: t('plans.purchaseError') });
    } finally {
      setBusyProduct(null);
    }
  }

  async function handleRestore() {
    if (iap.restoring) return;
    setFeedback(null);
    try {
      await iap.restore();
      await refresh();
      // refresh() atualiza `access` no próximo render; checamos o valor atual.
      setFeedback({
        kind: 'success',
        msg: access === 'restricted' ? t('plans.restoreNone') : t('plans.restoreSuccess'),
      });
    } catch {
      setFeedback({ kind: 'error', msg: t('plans.restoreError') });
    }
  }

  const manageText = isIOS
    ? t('plans.manageApple')
    : isAndroid
      ? t('plans.manageGoogle')
      : `${t('plans.manageApple')} ${t('plans.manageGoogle')}`;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        paddingBottom: '32px',
        backgroundColor: 'var(--cam-bg-page)',
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ padding: '48px 24px 16px 24px' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label={t('common.back')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: 'var(--cam-bg-card)',
            border: 'none',
            boxShadow: 'var(--cam-shadow-card)',
            cursor: 'pointer',
            marginBottom: '20px',
          }}
        >
          <ArrowLeft size={20} color="var(--cam-text-primary)" strokeWidth={2.2} />
        </button>

        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: 'var(--cam-bg-tint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          {access === 'restricted' ? (
            <Lock size={26} color="var(--cam-text-brand)" strokeWidth={2.2} />
          ) : (
            <Sparkles size={26} color="var(--cam-text-brand)" strokeWidth={2.2} />
          )}
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--cam-text-primary)', margin: '0 0 8px 0', lineHeight: 1.25 }}>
          {title}
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--cam-text-secondary)', margin: 0, lineHeight: 1.5 }}>
          {subtitle}
        </p>
      </div>

      {/* Alternância mensal/anual */}
      <div style={{ padding: '8px 24px 0 24px' }}>
        <CadenceToggle cadence={cadence} onChange={setCadence} />
      </div>

      {/* Cards de plano */}
      <div style={{ padding: '20px 24px 4px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {PLAN_ORDER.map((tier) => {
          const productId = productIdFor(tier, cadence);
          const offering = iap.offerings.get(productId);
          return (
            <PlanCard
              key={tier}
              plan={PLANS[tier]}
              cadence={cadence}
              firstAccess={firstAccess}
              storePrice={offering?.priceText ?? null}
              loading={busyProduct === productId}
              disabled={Boolean(busyProduct) || iap.restoring}
              onSubscribe={() => handleSubscribe(tier)}
            />
          );
        })}
      </div>

      {/* Feedback de compra/restauração */}
      {feedback && (
        <div style={{ padding: '4px 24px 0 24px' }}>
          <div
            style={{
              backgroundColor: feedback.kind === 'error' ? 'var(--cam-bg-danger, #FDECEC)' : 'var(--cam-bg-tint)',
              color: feedback.kind === 'error' ? 'var(--cam-text-danger, #B42318)' : 'var(--cam-text-brand)',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '13px',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            {feedback.msg}
          </div>
        </div>
      )}

      {/* Aviso de assinatura auto-renovável (exigência Apple/Google) */}
      <div style={{ padding: '16px 24px 0 24px' }}>
        <p style={{ fontSize: '12px', color: 'var(--cam-text-secondary)', margin: 0, lineHeight: 1.5, textAlign: 'center' }}>
          {t('plans.autoRenew', {
            cadence:
              cadence === 'annual' ? t('plans.cadenceAnnualWord') : t('plans.cadenceMonthlyWord'),
          })}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--cam-text-secondary)', margin: '6px 0 0 0', lineHeight: 1.5, textAlign: 'center' }}>
          {manageText}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--cam-text-secondary)', margin: '6px 0 0 0', lineHeight: 1.5, textAlign: 'center' }}>
          {t('plans.legalIntro')}{' '}
          <a href="/termos" target="_blank" rel="noopener noreferrer" style={legalLinkStyle}>
            {t('legal.termsLink')}
          </a>{' '}
          {t('plans.legalAnd')}{' '}
          <a href="/privacidade" target="_blank" rel="noopener noreferrer" style={legalLinkStyle}>
            {t('legal.privacyLink')}
          </a>
          .
        </p>
      </div>

      {/* Rodapé: restaurar compras + atalho pros insights se restrito */}
      <div style={{ padding: '16px 24px 0 24px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleRestore}
          disabled={iap.restoring || Boolean(busyProduct)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: 'var(--cam-text-secondary)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: iap.restoring ? 'default' : 'pointer',
            fontFamily: 'inherit',
            opacity: iap.restoring ? 0.7 : 1,
          }}
        >
          {iap.restoring ? <Loader2 size={15} strokeWidth={2.2} className="animate-spin" /> : <RotateCcw size={15} strokeWidth={2.2} />}
          {iap.restoring ? t('plans.restoring') : t('plans.restore')}
        </button>

        {access === 'restricted' && (
          <button
            type="button"
            onClick={() => navigate('/historico')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--cam-text-secondary)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {t('entitlement.paywallSeeInsights')}
          </button>
        )}
      </div>
    </div>
  );
}

function CadenceToggle({ cadence, onChange }: { cadence: Cadence; onChange: (c: Cadence) => void }) {
  const { t } = useTranslation();
  const options: { value: Cadence; label: string }[] = [
    { value: 'monthly', label: t('plans.cadenceMonthly') },
    { value: 'annual', label: t('plans.cadenceAnnual') },
  ];
  return (
    <div
      style={{
        display: 'flex',
        gap: '4px',
        padding: '4px',
        borderRadius: '9999px',
        backgroundColor: 'var(--cam-bg-muted)',
      }}
    >
      {options.map((opt) => {
        const selected = cadence === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              height: '40px',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: selected ? 'var(--cam-color-brand)' : 'transparent',
              color: selected ? 'var(--cam-text-on-brand)' : 'var(--cam-text-secondary)',
              boxShadow: selected ? 'var(--cam-shadow-brand)' : 'none',
              transition: 'background-color 0.2s ease, color 0.2s ease',
            }}
          >
            {opt.label}
            {opt.value === 'annual' && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  backgroundColor: selected ? 'rgba(255,255,255,0.22)' : 'var(--cam-bg-tint)',
                  color: selected ? 'var(--cam-text-on-brand)' : 'var(--cam-text-brand)',
                }}
              >
                {t('plans.annualBadge', { pct: PLANS.basico.annual.discountPct })}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function PlanCard({
  plan,
  cadence,
  firstAccess,
  storePrice,
  loading,
  disabled,
  onSubscribe,
}: {
  plan: TierPricing;
  cadence: Cadence;
  firstAccess: boolean;
  storePrice: string | null;
  loading: boolean;
  disabled: boolean;
  onSubscribe: () => void;
}) {
  const { t } = useTranslation();
  const isAnnual = cadence === 'annual';
  const usePromo = isAnnual && firstAccess;

  const tierLabel = t(`plans.tier${capitalize(plan.tier)}` as const);
  const tagline = plan.tier === 'basico' ? t('plans.basicoTagline') : t('plans.avancadoTagline');

  // Preço grande + sufixo. Loja (localizado) > promo de 1º acesso > vitrine.
  const suffix = isAnnual ? t('plans.perYearSuffix') : t('plans.perMonthSuffix');
  let price: string;
  if (storePrice) {
    price = storePrice; // já localizado pela loja (moeda do país)
  } else if (!isAnnual) {
    price = formatBRL(plan.monthly.priceBRL);
  } else if (usePromo) {
    price = formatBRL(plan.firstAccessPromo.priceBRL);
  } else {
    price = formatBRL(plan.annual.priceBRL);
  }

  // Linhas de apoio (equivalente mensal / preço riscado da promo) só fazem
  // sentido no fallback da vitrine; com preço da loja mostramos só o preço.
  const showSupportLines = isAnnual && !storePrice;

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: 'var(--cam-bg-card)',
        borderRadius: '20px',
        padding: '20px',
        boxShadow: 'var(--cam-shadow-card)',
        border: isAnnual ? '2px solid var(--cam-color-brand)' : '2px solid transparent',
      }}
    >
      {/* Ribbon de destaque do anual */}
      {isAnnual && (
        <div
          style={{
            position: 'absolute',
            top: '-11px',
            right: '20px',
            backgroundColor: 'var(--cam-color-brand)',
            color: 'var(--cam-text-on-brand)',
            fontSize: '11px',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: '9999px',
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
          }}
        >
          {usePromo
            ? t('plans.promoBadge', { pct: plan.firstAccessPromo.discountPct })
            : t('plans.bestValue')}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
        <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--cam-text-primary)' }}>{tierLabel}</span>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--cam-text-secondary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
        {tagline}
      </p>

      {/* Preço */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '16px' }}>
        <span style={{ fontSize: '30px', fontWeight: 800, color: 'var(--cam-text-primary)', letterSpacing: '-0.5px' }}>
          {price}
        </span>
        <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--cam-text-secondary)' }}>{suffix}</span>
      </div>

      {/* Linha de apoio (equivalente mensal + promo, só no fallback) */}
      {showSupportLines && (
        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '13px', color: 'var(--cam-text-secondary)', fontWeight: 500 }}>
            {t('plans.annualEquiv', {
              price: formatBRL(usePromo ? plan.firstAccessPromo.perMonthBRL : plan.annual.perMonthBRL),
            })}
          </span>
          {usePromo && (
            <span style={{ fontSize: '12px', color: 'var(--cam-text-secondary)', textDecoration: 'line-through' }}>
              {formatBRL(plan.annual.priceBRL)}
            </span>
          )}
        </div>
      )}

      {/* Limite mensal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px' }}>
        <Check size={16} color="var(--cam-text-brand)" strokeWidth={2.6} />
        <span style={{ fontSize: '14px', color: 'var(--cam-text-primary)', fontWeight: 500 }}>
          {t('plans.limit', { count: plan.monthlyLimit })}
        </span>
      </div>

      {/* Assinar */}
      <button
        type="button"
        onClick={onSubscribe}
        disabled={disabled}
        style={{
          marginTop: '18px',
          width: '100%',
          height: '52px',
          borderRadius: '9999px',
          backgroundColor: isAnnual ? 'var(--cam-color-brand)' : 'transparent',
          color: isAnnual ? 'var(--cam-text-on-brand)' : 'var(--cam-text-brand)',
          border: isAnnual ? 'none' : '2px solid var(--cam-color-brand)',
          boxShadow: isAnnual ? 'var(--cam-shadow-brand)' : 'none',
          fontSize: '16px',
          fontWeight: 700,
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled && !loading ? 0.6 : 1,
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {loading && <Loader2 size={18} strokeWidth={2.4} className="animate-spin" />}
        {loading ? t('plans.subscribing') : t('plans.subscribe')}
      </button>
    </div>
  );
}

function capitalize<T extends string>(s: T): Capitalize<T> {
  return (s.charAt(0).toUpperCase() + s.slice(1)) as Capitalize<T>;
}

const legalLinkStyle: React.CSSProperties = {
  color: 'var(--cam-text-brand)',
  fontWeight: 700,
  textDecoration: 'underline',
};
