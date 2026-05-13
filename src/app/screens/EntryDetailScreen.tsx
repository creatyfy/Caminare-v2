import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Clock, Heart, Brain } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { getEntryById, type EntryDetail } from '../lib/db';
import { formatDate } from '../lib/format';

export function EntryDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [entry, setEntry] = useState<EntryDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    let active = true;
    setLoading(true);
    getEntryById(user.id, id).then((data) => {
      if (!active) return;
      setEntry(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user, id]);

  if (loading) {
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
        <p style={{ color: '#8B87A8', fontSize: '15px' }}>Carregando...</p>
      </div>
    );
  }

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

  const { date, time } = formatDate(entry.created_at);

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
            <span>{date}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} />
            <span>{time}</span>
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
            {entry.raw_text}
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
          {entry.emotions.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#8B87A8', margin: 0 }}>
              Nenhuma emoção validada ainda.
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {entry.emotions.map((emotion) => (
                <span key={emotion.id} style={{
                  backgroundColor: '#F0EFFF',
                  color: '#534AB7',
                  padding: '8px 14px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}>
                  {emotion.name}
                </span>
              ))}
            </div>
          )}
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
          {entry.parsed_thoughts.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#8B87A8', margin: 0 }}>
              Nenhum pensamento identificado ainda.
            </p>
          ) : (
            <ul style={{
              margin: 0,
              paddingLeft: '20px',
              listStyleType: 'disc',
              listStylePosition: 'outside',
              color: '#2D2A45',
              fontSize: '15px',
              lineHeight: '1.6'
            }}>
              {entry.parsed_thoughts.map((thought, idx) => (
                <li key={idx} style={{ display: 'list-item', marginBottom: '4px' }}>
                  "{thought}"
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
