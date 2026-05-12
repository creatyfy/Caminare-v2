import { Check, X, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState } from 'react';

export function EmotionValidationScreen() {
  const navigate = useNavigate();
  const [emotions, setEmotions] = useState([
    { id: 1, label: 'Ansiedade', validated: null as boolean | null },
    { id: 2, label: 'Preocupação', validated: null as boolean | null },
    { id: 3, label: 'Insegurança', validated: null as boolean | null },
  ]);

  const [thoughts, setThoughts] = useState([
    { id: 1, text: 'Não vou conseguir fazer a apresentação', validated: null as boolean | null, isEditing: false },
    { id: 2, text: 'Nunca sou boa o suficiente', validated: null as boolean | null, isEditing: false },
  ]);

  const [isAddingEmotion, setIsAddingEmotion] = useState(false);
  const [newEmotion, setNewEmotion] = useState('');

  const handleEmotionValidation = (id: number, isValid: boolean) => {
    setEmotions(emotions.map(e => e.id === id ? { ...e, validated: isValid } : e));
  };

  const handleAddEmotion = () => {
    if (newEmotion.trim()) {
      setEmotions([...emotions, { id: Date.now(), label: newEmotion.trim(), validated: true }]);
      setNewEmotion('');
      setIsAddingEmotion(false);
    }
  };

  const handleThoughtValidation = (id: number, isValid: boolean) => {
    setThoughts(thoughts.map(t => t.id === id ? { ...t, validated: isValid, isEditing: false } : t));
  };

  const toggleThoughtEdit = (id: number) => {
    setThoughts(thoughts.map(t => t.id === id ? { ...t, isEditing: !t.isEditing } : t));
  };

  const handleThoughtTextChange = (id: number, newText: string) => {
    setThoughts(thoughts.map(t => t.id === id ? { ...t, text: newText } : t));
  };

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
        <button 
          onClick={() => navigate('/gravacao')} 
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

        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#2D2A45', margin: '0 0 8px 0' }}>
          Validação
        </h1>
        <p style={{ fontSize: '15px', color: '#8B87A8', margin: 0, lineHeight: '1.4' }}>
          Valide as emoções e pensamentos que identificamos.
        </p>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        
        {/* Emoções Section */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#8B87A8', marginBottom: '16px', marginLeft: '4px' }}>
            Emoções identificadas
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {emotions.map((emotion) => (
              <div key={emotion.id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)'
              }}>
                {/* Reject Button (Left) */}
                <button
                  onClick={() => handleEmotionValidation(emotion.id, false)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: emotion.validated === false ? '#DC2626' : '#FEF2F2',
                    color: emotion.validated === false ? '#FFFFFF' : '#DC2626'
                  }}
                >
                  <X size={18} strokeWidth={2.5} />
                </button>

                {/* Emotion Label (Center) */}
                <div style={{
                  backgroundColor: '#F0EFFF',
                  color: '#534AB7',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: '500',
                  flex: 1,
                  textAlign: 'center',
                  margin: '0 12px'
                }}>
                  {emotion.label}
                </div>
                
                {/* Confirm Button (Right) */}
                <button
                  onClick={() => handleEmotionValidation(emotion.id, true)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: emotion.validated === true ? '#1D9E75' : '#E8F5F0',
                    color: emotion.validated === true ? '#FFFFFF' : '#1D9E75'
                  }}
                >
                  <Check size={18} strokeWidth={2.5} />
                </button>
              </div>
            ))}

            {/* Add Emotion Button / Input */}
            {!isAddingEmotion ? (
              <button
                onClick={() => setIsAddingEmotion(true)}
                style={{
                  backgroundColor: 'transparent',
                  border: '2px dashed rgba(83, 74, 183, 0.2)',
                  borderRadius: '24px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: '#534AB7',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginTop: '4px'
                }}
              >
                <Plus size={18} strokeWidth={2.5} />
                Adicionar emoção
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <input
                  value={newEmotion}
                  onChange={(e) => setNewEmotion(e.target.value)}
                  placeholder="Digite uma emoção..."
                  autoFocus
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(83, 74, 183, 0.2)',
                    outline: 'none',
                    fontSize: '14px',
                    color: '#2D2A45'
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddEmotion()}
                />
                <button
                  onClick={handleAddEmotion}
                  style={{
                    padding: '0 20px',
                    backgroundColor: '#534AB7',
                    color: '#FFFFFF',
                    borderRadius: '9999px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Adicionar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pensamentos Section */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#8B87A8', marginBottom: '16px', marginLeft: '4px' }}>
            Pensamentos identificados
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {thoughts.map((thought) => (
              <div key={thought.id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                padding: '20px',
                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)'
              }}>
                {thought.isEditing ? (
                  <textarea
                    value={thought.text}
                    onChange={(e) => handleThoughtTextChange(thought.id, e.target.value)}
                    autoFocus
                    style={{
                      width: '100%',
                      minHeight: '60px',
                      color: '#2D2A45',
                      fontSize: '15px',
                      lineHeight: '1.5',
                      marginBottom: '20px',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid rgba(83, 74, 183, 0.2)',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                ) : (
                  <p style={{ 
                    color: '#2D2A45', 
                    fontSize: '15px', 
                    lineHeight: '1.5', 
                    margin: '0 0 20px 0' 
                  }}>
                    {thought.text}
                  </p>
                )}
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* Rejeitar (Left) */}
                  <button
                    onClick={() => handleThoughtValidation(thought.id, false)}
                    style={{
                      flex: 1,
                      padding: '12px 0',
                      borderRadius: '9999px',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: thought.validated === false ? '#DC2626' : '#FEF2F2',
                      color: thought.validated === false ? '#FFFFFF' : '#DC2626'
                    }}
                  >
                    Rejeitar
                  </button>

                  {/* Editar / Salvar (Center) */}
                  <button
                    onClick={() => toggleThoughtEdit(thought.id)}
                    style={{
                      flex: 1,
                      padding: '12px 0',
                      borderRadius: '9999px',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: thought.isEditing ? '#534AB7' : '#F0EFFF',
                      color: thought.isEditing ? '#FFFFFF' : '#534AB7'
                    }}
                  >
                    {thought.isEditing ? 'Salvar' : 'Editar'}
                  </button>

                  {/* Confirmar (Right) */}
                  <button
                    onClick={() => handleThoughtValidation(thought.id, true)}
                    style={{
                      flex: 1,
                      padding: '12px 0',
                      borderRadius: '9999px',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: thought.validated === true ? '#1D9E75' : '#E8F5F0',
                      color: thought.validated === true ? '#FFFFFF' : '#1D9E75'
                    }}
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/validacao-crencas')}
          style={{
            width: '100%',
            height: '56px',
            backgroundColor: '#534AB7',
            color: '#FFFFFF',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            boxShadow: '0px 8px 24px rgba(83, 74, 183, 0.25)',
            cursor: 'pointer',
            marginTop: '16px'
          }}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
