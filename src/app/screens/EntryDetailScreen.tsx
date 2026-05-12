import { ArrowLeft, Calendar, Clock, Heart, Brain } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { getEntryById } from '../data/entries';

export function EntryDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const entry = id ? getEntryById(Number(id)) : undefined;

  if (!entry) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#F8F7FF',
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
        padding: '48px 24px'
      }}>
        <button
          onClick={() => navigate('/historico')}
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
            marginBottom: '24px'
          }}
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
        <p style={{ color: '#2D2A45', fontSize: '16px' }}>Registro não encontrado.</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#F8F7FF',
      fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{ padding: '48px 24px 16px 24px', backgroundColor: '#FFFFFF' }}>
        <button
          onClick={() => navigate('/historico')}
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
            marginBottom: '16px'
          }}
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>

        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#2D2A45', margin: '0 0 12px 0' }}>
          Registro completo
        </h1>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#8B87A8',
          fontSize: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} />
            <span>{entry.date}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} />
            <span>{entry.time}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Full text */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)'
        }}>
          <h3 style={{ fontSize: '13px', color: '#8B87A8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px 0' }}>
            Texto do registro
          </h3>
          <p style={{
            fontSize: '16px',
            color: '#2D2A45',
            lineHeight: '1.6',
            margin: 0,
            whiteSpace: 'pre-wrap'
          }}>
            {entry.fullText}
          </p>
        </div>

        {/* Emotions */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Heart size={18} color="#534AB7" strokeWidth={2.5} />
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#2D2A45', margin: 0 }}>
              Emoções validadas
            </h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {entry.emotions.map((emotion, idx) => (
              <span key={idx} style={{
                backgroundColor: '#F0EFFF',
                color: '#534AB7',
                padding: '8px 14px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                {emotion}
              </span>
            ))}
          </div>
        </div>

        {/* Thoughts */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Brain size={18} color="#534AB7" strokeWidth={2.5} />
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#2D2A45', margin: 0 }}>
              Pensamentos identificados
            </h3>
          </div>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            listStyleType: 'disc',
            listStylePosition: 'outside',
            color: '#2D2A45',
            fontSize: '15px',
            lineHeight: '1.6'
          }}>
            {entry.thoughts.map((thought, idx) => (
              <li key={idx} style={{ display: 'list-item', marginBottom: '4px' }}>
                "{thought}"
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
