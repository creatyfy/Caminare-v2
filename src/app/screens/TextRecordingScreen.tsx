import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { createTextEntry } from '../lib/db';

export function TextRecordingScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!text.trim() || submitting || !user) return;
    setSubmitting(true);
    setError(null);
    try {
      const entryId = await createTextEntry(user.id, text.trim());
      if (!entryId) {
        setError('Não foi possível salvar o registro. Tente novamente.');
        return;
      }
      navigate(`/validacao-emocoes?entryId=${entryId}`);
    } catch (err) {
      console.error('Erro ao salvar registro:', err);
      setError('Erro ao salvar o registro.');
    } finally {
      setSubmitting(false);
    }
  }

  const disabled = text.trim().length === 0 || submitting;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#F8F7FF',
      fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Header Area (compact to maximize textarea space) */}
      <div style={{ padding: '32px 24px 12px 24px', flexShrink: 0 }}>
        <button
          onClick={() => navigate('/home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#534AB7',
            background: 'none',
            border: 'none',
            fontSize: '16px',
            fontWeight: '500',
            padding: 0,
            cursor: 'pointer',
            marginBottom: '12px'
          }}
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>

        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#2D2A45', margin: '0 0 4px 0' }}>
          Novo Registro por Texto
        </h1>
      </div>

      {/* Main Content Area — textarea takes most of the screen */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '8px 24px 24px 24px',
        minHeight: 0
      }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Como você está se sentindo hoje? O que aconteceu?"
          disabled={submitting}
          style={{
            flex: 1,
            width: '100%',
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(83, 74, 183, 0.1)',
            borderRadius: '20px',
            padding: '20px',
            fontSize: '17px',
            color: '#2D2A45',
            lineHeight: '1.6',
            resize: 'none',
            outline: 'none',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            marginBottom: '16px',
            minHeight: 0
          }}
        />

        {error && (
          <div role="alert" style={{
            backgroundColor: 'rgba(220, 38, 38, 0.08)',
            color: '#DC2626',
            borderRadius: '12px',
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: 500,
            marginBottom: '12px'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={disabled}
          style={{
            width: '100%',
            height: '56px',
            backgroundColor: disabled ? '#E8E6F7' : '#1D9E75',
            color: disabled ? '#8B87A8' : '#FFFFFF',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            boxShadow: disabled ? 'none' : '0px 4px 12px rgba(29, 158, 117, 0.2)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
        >
          {submitting ? 'Salvando...' : 'Concluir Registro'}
        </button>
      </div>
    </div>
  );
}
