import { useEffect, useMemo, useState } from 'react';
import { Calendar, Heart, Search, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { getEntries, type EntryWithEmotions } from '../lib/db';
import { formatDate } from '../lib/format';

type FilterValue = '7days' | '30days' | 'all';

export function HistoryScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState<EntryWithEmotions[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterValue>('all');

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    getEntries(user.id, filter).then((data) => {
      if (!active) return;
      setEntries(data ?? []);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user, filter]);

  const filteredEntries = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return entries;
    return entries.filter((e) => e.raw_text.toLowerCase().includes(term));
  }, [entries, search]);

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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterValue)}
            style={{
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
            }}
          >
            <option value="all">Todos</option>
            <option value="7days">7 dias</option>
            <option value="30days">30 dias</option>
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
        {loading && (
          <div style={{ textAlign: 'center', color: '#8B87A8', fontSize: '14px', padding: '32px 0' }}>
            Carregando...
          </div>
        )}

        {!loading && filteredEntries.length === 0 && (
          <div style={{ textAlign: 'center', color: '#8B87A8', fontSize: '14px', padding: '32px 0', lineHeight: '1.5' }}>
            {search.trim()
              ? 'Nenhum registro encontrado para a busca.'
              : 'Nenhum registro ainda. Crie seu primeiro registro!'}
          </div>
        )}

        {!loading && filteredEntries.map((entry) => {
          const { date, time } = formatDate(entry.created_at);
          const summary = entry.raw_text.length > 100
            ? entry.raw_text.slice(0, 100).trimEnd() + '…'
            : entry.raw_text;
          const color = '#534AB7';
          return (
            <div
              key={entry.id}
              onClick={() => navigate(`/registro/${entry.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/registro/${entry.id}`);
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
                backgroundColor: `${color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Heart size={20} color={color} strokeWidth={2.5} />
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
                  <span>{date}</span>
                  <span>•</span>
                  <span>{time}</span>
                </div>

                <p style={{
                  color: '#2D2A45',
                  fontSize: '15px',
                  lineHeight: '1.5',
                  margin: '0 0 12px 0'
                }}>
                  {summary}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {entry.emotions.map((emotion) => (
                    <span key={emotion.id} style={{
                      backgroundColor: '#F0EFFF',
                      color: '#534AB7',
                      padding: '6px 12px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {emotion.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
