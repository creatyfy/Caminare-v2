import { useEffect, useState } from 'react';
import { Brain } from 'lucide-react';
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
    return () => { active = false; };
  }, [user]);

  // Tamanho da fonte da nuvem proporcional à contagem
  const maxCount = emotions[0]?.count ?? 1;
  const fontSize = (count: number) => {
    const min = 13, max = 32;
    return Math.round(min + ((count / maxCount) * (max - min)));
  };
  const opacity = (count: number) => {
    const min = 0.5, max = 1;
    return +(min + ((count / maxCount) * (max - min))).toFixed(2);
  };

  const isEmpty = !loading && emotions.length === 0 && beliefs.length === 0 && patterns.length === 0;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#F8F7FF',
      fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Header */}
      <div style={{ padding: '48px 24px 24px 24px', backgroundColor: '#FFFFFF' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#2D2A45', margin: '0 0 8px 0' }}>
          Insights
        </h1>
        <p style={{ fontSize: '15px', color: '#8B87A8', margin: 0, lineHeight: '1.4' }}>
          Suas emoções, pensamentos, crenças e padrões
        </p>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: '100px'
      }}>

        {loading && (
          <div style={{ textAlign: 'center', color: '#8B87A8', fontSize: '15px', marginTop: '48px' }}>
            Carregando insights...
          </div>
        )}

        {isEmpty && (
          <div style={{
            textAlign: 'center',
            color: '#8B87A8',
            fontSize: '15px',
            marginTop: '48px',
            lineHeight: '1.6'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🌱</div>
            Seus insights aparecem aqui após você criar e validar seus primeiros registros.
          </div>
        )}

        {/* Nuvem de Emoções */}
        {!loading && emotions.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#8B87A8', marginBottom: '16px', marginLeft: '4px' }}>
              Minhas principais emoções
            </h3>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px 24px',
              boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px 16px',
            }}>
              {emotions.map((e) => (
                <span
                  key={e.name}
                  style={{
                    fontSize: `${fontSize(e.count)}px`,
                    fontWeight: '600',
                    color: '#534AB7',
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

        {/* Crenças Recorrentes */}
        {!loading && beliefs.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#8B87A8', marginBottom: '16px', marginLeft: '4px' }}>
              Crenças Recorrentes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {beliefs.map((belief) => (
                <div key={belief.id} style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '24px',
                  padding: '20px',
                  boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  gap: '16px',
                }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    backgroundColor: '#F0EFFF', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Brain size={24} color="#534AB7" strokeWidth={2} />
                  </div>
                  <div>
                    <h4 style={{ color: '#2D2A45', fontSize: '16px', fontWeight: '600', lineHeight: '1.4', margin: '0 0 6px 0' }}>
                      {belief.content}
                    </h4>
                    <p style={{ fontSize: '13px', color: '#8B87A8', margin: 0 }}>
                      {belief.occurrence_count} {belief.occurrence_count === 1 ? 'ocorrência' : 'ocorrências'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Padrões Comportamentais */}
        {!loading && patterns.length > 0 && (
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#8B87A8', marginBottom: '16px', marginLeft: '4px' }}>
              Padrões Comportamentais
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {patterns.map((pattern) => (
                <div key={pattern.id} style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '24px',
                  padding: '20px',
                  boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)'
                }}>
                  <div style={{
                    backgroundColor: '#F0EFFF', borderRadius: '12px',
                    padding: '10px 14px', marginBottom: '12px'
                  }}>
                    <span style={{ color: '#534AB7', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Padrão detectado
                    </span>
                  </div>
                  <p style={{ fontSize: '15px', color: '#2D2A45', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                    {pattern.description}
                  </p>
                  {(pattern.triggers ?? []).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {pattern.triggers.map((trigger, idx) => (
                        <span key={idx} style={{
                          backgroundColor: '#F0EFFF', color: '#534AB7',
                          padding: '6px 12px', borderRadius: '9999px',
                          fontSize: '12px', fontWeight: '500'
                        }}>
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
