import { useState, useEffect } from 'react';
import { Mic, Square, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useNavigate } from 'react-router';

export function RecordingScreen() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcription, setTranscription] = useState('');

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setDuration(d => d + 1);
        if (duration === 3) {
          setTranscription('Eu me sinto muito ansiosa hoje...');
        } else if (duration === 6) {
          setTranscription('Eu me sinto muito ansiosa hoje... Tenho uma apresentação importante amanhã e continuo achando que não vou conseguir.');
        } else if (duration === 9) {
          setTranscription('Eu me sinto muito ansiosa hoje... Tenho uma apresentação importante amanhã e continuo achando que não vou conseguir. Esse pensamento de "nunca sou boa o suficiente" volta sempre.');
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRecording, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleRecording = () => {
    if (isRecording) {
      navigate('/validacao-emocoes');
    } else {
      setIsRecording(true);
      setDuration(0);
      setTranscription('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#F8F7FF] to-white">
      <div className="px-6 pt-12 pb-6">
        <button onClick={() => navigate('/')} className="text-[#534AB7] flex items-center gap-2 mb-6">
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>

        <h1 className="text-2xl text-[#2D2A45] mb-2">Novo Registro</h1>
        <p className="text-[#8B87A8]">Compartilhe seus pensamentos e emoções</p>
      </div>

      <div className="flex-1 px-6 flex flex-col items-center justify-center">
        <div className="relative mb-8">
          <button
            onClick={toggleRecording}
            className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all ${
              isRecording
                ? 'bg-[#DC2626] hover:bg-[#B91C1C] animate-pulse'
                : 'bg-[#534AB7] hover:bg-[#453EA0]'
            }`}
          >
            {isRecording ? (
              <Square size={40} className="text-white" fill="white" />
            ) : (
              <Mic size={40} className="text-white" strokeWidth={2} />
            )}
          </button>

          {isRecording && (
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-64">
              <div className="flex justify-center items-center gap-1">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-[#534AB7] rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 40 + 20}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {isRecording && (
          <div className="text-3xl font-semibold text-[#534AB7] mb-12 mt-12">
            {formatTime(duration)}
          </div>
        )}

        {transcription && (
          <Card className="p-6 bg-white shadow-lg w-full max-w-sm">
            <div className="text-sm text-[#8B87A8] mb-2">Transcrição em tempo real:</div>
            <p className="text-[#2D2A45] leading-relaxed">{transcription}</p>
          </Card>
        )}

        {!isRecording && !transcription && (
          <div className="text-center text-[#8B87A8] max-w-xs">
            Toque no botão para começar a gravar seus pensamentos e emoções
          </div>
        )}

        {isRecording && (
          <Button
            onClick={toggleRecording}
            className="mt-8 bg-[#1D9E75] hover:bg-[#188A64] text-white px-8 rounded-full"
          >
            Concluir Gravação
          </Button>
        )}
      </div>
    </div>
  );
}
