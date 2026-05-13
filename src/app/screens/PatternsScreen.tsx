import { useEffect, useState } from 'react';
import { Brain } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  getEmotionCounts,
  getBeliefs,
  getPatterns,
  type EmotionCount,
  type BeliefInsight,
  type PatternInsight,
} from '../lib/db';

export function PatternsScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [emotions, setEmotions] = useState<EmotionCount[]>([]);
  const [beliefs, setBeliefs] = useState<BeliefInsight[]>([]);
  const [patterns, setPatterns] = useState<PatternInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    Promise.all([
      getEmotionCounts(user.id),
      getBeliefs(user.id),
      getPatterns(user.id),
    ]).then(([e, b, p]) => {
      if (!active) return;
      setEmotions(e);
      setBeliefs(b);
      setPatterns(p);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user]);

  const maxCount = emotions[0]?.count ?? 1;
  const fontSize = (count: number) => {
    const min = 13,
      max = 32;
    return Math.round(min + (count / maxCount) * (max - min));
  };
  const opacity = (count: number) => {
    const min = 0.5,
      max = 1;
    return +(min + (count / maxCount) * (max - min)).toFixed(2);
  };

  const isEmpty =
    !loading && emotions.length === 0 && beliefs.length === 0 && patterns.length === 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--cam-bg-page)',
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div style={{ padding: '48px 24px 24px 24px', backgroundColor: 'var(--cam-bg-card)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--cam-text-primary)', margin: '0 0 8px 0' }}>
          {t('patterns.title')}
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--cam-text-secondary)', margin: 0, lineHeight: 1.4 }}>
          {t('patterns.subtitle')}
        </p>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: '100px',
        }}
      >
        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--cam-text-secondary)', fontSize: '15px', marginTop: '48px' }}>
            {t('patterns.loading')}
          </div>
        )}

        {isEmpty && (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--cam-text-secondary)',
              fontSize: '15px',
              marginTop: '48px',
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🌱</div>
            {t('patterns.empty')}
          </div>
        )}

        {!loading && emotions.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cam-text-secondary)', marginBottom: '16px', marginLeft: '4px' }}>
              {t('patterns.emotionsHeader')}
            </h3>
            <div
              style={{
                backgroundColor: 'var(--cam-bg-card)',
                borderRadius: '24px',
                padding: '32px 24px',
                boxShadow: 'var(--cam-shadow-card)',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px 16px',
              }}
            >
              {emotions.map((e) => (
                <span
                  key={e.name}
                  style={{
                    fontSize: `${fontSize(e.count)}px`,
                    fontWeight: 600,
                    color: 'var(--cam-text-brand)',
                    opacity: opacity(e.count),
                    lineHeight: 1.2,
                  }}
                >
                  {e.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {!loading && beliefs.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cam-text-secondary)', marginBottom: '16px', marginLeft: '4px' }}>
              {t('patterns.beliefsHeader')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {beliefs.map((belief) => (
                <div
                  key={belief.id}
                  style={{
                    backgroundColor: 'var(--cam-bg-card)',
                    borderRadius: '24px',
                    padding: '20px',
                    boxShadow: 'var(--cam-shadow-card)',
                    display: 'flex',
                    gap: '16px',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--cam-bg-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Brain size={24} color="var(--cam-text-brand)" strokeWidth={2} />
                  </div>
                  <div>
                    <h4
                      style={{
                        color: 'var(--cam-text-primary)',
                        fontSize: '16px',
                        fontWeight: 600,
                        lineHeight: 1.4,
                        margin: '0 0 6px 0',
                      }}
                    >
                      {belief.content}
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--cam-text-secondary)', margin: 0 }}>
                      {belief.occurrence_count}{' '}
                      {belief.occurrence_count === 1 ? t('common.occurrence') : t('common.occurrences')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && patterns.length > 0 && (
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cam-text-secondary)', marginBottom: '16px', marginLeft: '4px' }}>
              {t('patterns.patternsHeader')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {patterns.map((pattern) => (
                <div
                  key={pattern.id}
                  style={{
                    backgroundColor: 'var(--cam-bg-card)',
                    borderRadius: '24px',
                    padding: '20px',
                    boxShadow: 'var(--cam-shadow-card)',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: 'var(--cam-bg-muted)',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      marginBottom: '12px',
                    }}
                  >
                    <span
                      style={{
                        color: 'var(--cam-text-brand)',
                        fontSize: '12px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {t('patterns.patternBadge')}
                    </span>
                  </div>
                  <p style={{ fontSize: '15px', color: 'var(--cam-text-primary)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                    {pattern.description}
                  </p>
                  {(pattern.triggers ?? []).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {pattern.triggers.map((trigger, idx) => (
                        <span
                          key={idx}
                          style={{
                            backgroundColor: 'var(--cam-bg-muted)',
                            color: 'var(--cam-text-brand)',
                            padding: '6px 12px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: 500,
                          }}
                        >
                          {trigger}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
