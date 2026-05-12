import { Calendar, Heart, Search, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router';
import { entries } from '../data/entries';

export function HistoryScreen() {
  const navigate = useNavigate();

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
          Histórico
        </h1>
        <p style={{ fontSize: '15px', color: '#8B87A8', margin: 0, lineHeight: '1.4' }}>
          Seus registros
        </p>
      </div>

      {/* Search & Filter */}
      <div style={{
        padding: '0 24px 24px 24px',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        gap: '12px'
      }}>
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} color="#8B87A8" style={{ position: 'absolute', left: '16px' }} />
          <input
            type="text"
            placeholder="Buscar registros..."
            style={{
              width: '100%',
              height: '44px',
              backgroundColor: '#F8F7FF',
              border: 'none',
              borderRadius: '9999px',
              padding: '0 16px 0 44px',
              fontSize: '15px',
              color: '#2D2A45',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <select style={{
            appearance: 'none',
            height: '44px',
            backgroundColor: '#F8F7FF',
            border: 'none',
            borderRadius: '9999px',
            padding: '0 36px 0 20px',
            fontSize: '15px',
            color: '#2D2A45',
            fontWeight: '500',
            outline: 'none',
            cursor: 'pointer'
          }}>
            <option>Todos</option>
            <option>7 dias</option>
            <option>30 dias</option>
          </select>
          <ChevronDown size={16} color="#8B87A8" style={{ position: 'absolute', right: '12px', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        paddingBottom: '100px'
      }}>
        {entries.map((record) => (
          <div
            key={record.id}
            onClick={() => navigate(`/registro/${record.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(`/registro/${record.id}`);
              }
            }}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '20px',
              boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              gap: '16px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {/* Icon */}
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: `${record.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Heart size={20} color={record.color} strokeWidth={2.5} />
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '8px',
                color: '#8B87A8',
                fontSize: '13px'
              }}>
                <Calendar size={14} />
                <span>{record.date}</span>
                <span>•</span>
                <span>{record.time}</span>
              </div>

              <p style={{
                color: '#2D2A45',
                fontSize: '15px',
                lineHeight: '1.5',
                margin: '0 0 12px 0'
              }}>
                {record.summary}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {record.emotions.map((emotion, idx) => (
                  <span key={idx} style={{
                    backgroundColor: '#F0EFFF',
                    color: '#534AB7',
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {emotion}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
