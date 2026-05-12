import { Mic, Heart, Brain, TrendingUp, BookOpen, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router';

export function HomeScreen() {
  const navigate = useNavigate();

  const stats = [
    { icon: Heart, label: 'Emoções', value: '24', color: '#6558D3', bgColor: '#F0EFFF' },
    { icon: Brain, label: 'Padrões', value: '7', color: '#6558D3', bgColor: '#F0EFFF' },
    { icon: TrendingUp, label: 'Dias', value: '12', color: '#6558D3', bgColor: '#F0EFFF' },
    { icon: BookOpen, label: 'Registros', value: '45', color: '#8B5CF6', bgColor: '#F3EFFF' },
  ];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100%', 
      paddingBottom: '90px', 
      backgroundColor: '#F8F7FF', 
      fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif' 
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#6558D3',
        padding: '64px 24px 80px 24px',
        borderBottomLeftRadius: '32px',
        borderBottomRightRadius: '32px',
        color: '#FFFFFF'
      }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>Olá, Maria</h1>
        <p style={{ fontSize: '15px', margin: 0, opacity: 0.9, fontWeight: '400' }}>O que aconteceu hoje?</p>
      </div>

      {/* Content */}
      <div style={{ padding: '0 24px', marginTop: '-54px', flex: 1 }}>
        
        {/* Stats Grid (4 columns) */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px', 
            marginBottom: '24px',
          }}
        >
          {stats.map((stat, index) => (
            <div key={index} style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '12px 4px',
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: stat.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px'
              }}>
                <stat.icon size={14} color={stat.color} strokeWidth={2.5} />
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#2D2A45', lineHeight: '1', marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '10px', color: '#8B87A8', fontWeight: '500', lineHeight: '1.2' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => navigate('/gravacao')}
            style={{
              width: '100%',
              height: '56px',
              backgroundColor: '#534AB7',
              color: '#FFFFFF',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              boxShadow: '0px 8px 24px rgba(83, 74, 183, 0.25)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Mic size={20} strokeWidth={2.5} />
            Novo Registro
          </button>

          <button
            onClick={() => navigate('/registro-texto')}
            style={{
              width: '100%',
              height: '56px',
              backgroundColor: '#FFFFFF',
              color: '#534AB7',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '16px',
              fontWeight: '600',
              border: '2px solid #534AB7',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Edit3 size={20} strokeWidth={2.5} />
            Novo Registro (Texto)
          </button>
        </div>

        {/* Recent Records */}
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#8B87A8', marginBottom: '16px', marginLeft: '4px' }}>
            Registros recentes
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { summary: 'Briga com Fulano', time: 'Há 2 horas', color: '#6558D3', bgColor: '#F0EFFF' },
              { summary: 'Acesso de raiva no trabalho', time: 'Ontem às 18:30', color: '#DC2626', bgColor: '#FEF2F2' },
              { summary: 'Sentimento de desesperança à noite', time: 'Ontem às 14:20', color: '#F59E0B', bgColor: '#FEF5E7' },
            ].map((record, index) => (
              <div key={index} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '16px',
                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: record.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Heart size={20} color={record.color} strokeWidth={2.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '15px', 
                    fontWeight: '700', 
                    color: '#2D2A45', 
                    marginBottom: '4px',
                    lineHeight: '1.3'
                  }}>
                    {record.summary}
                  </div>
                  <div style={{ fontSize: '13px', color: '#8B87A8', fontWeight: '500' }}>
                    {record.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
