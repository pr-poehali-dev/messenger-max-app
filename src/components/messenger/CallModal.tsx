import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface Props {
  type: 'voice' | 'video';
  name: string;
  avatar: string;
  onClose: () => void;
}

export default function CallModal({ type, name, avatar, onClose }: Props) {
  const [status, setStatus] = useState<'calling' | 'connected'>('calling');
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStatus('connected'), 2500);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (status !== 'connected') return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-80 bg-white rounded-3xl overflow-hidden shadow-2xl">
        {type === 'video' ? (
          <div className="relative h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            {cameraOff ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-3xl">{avatar}</div>
                <span className="text-white/60 text-sm">Камера выключена</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-3xl">{avatar}</div>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>
            )}
            <div className="absolute bottom-3 right-3 w-20 h-14 bg-gray-700 rounded-xl flex items-center justify-center text-xs text-white/50">
              Вы
            </div>
          </div>
        ) : (
          <div className="h-52 bg-gradient-to-br from-messenger-blue to-blue-700 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl mb-3">
              {avatar}
            </div>
            <div className="w-16 h-16 rounded-full bg-white/10 absolute animate-ping" style={{ animationDuration: '2s' }} />
          </div>
        )}

        <div className="px-6 pt-4 pb-6">
          <div className="text-center mb-5">
            <h3 className="font-semibold text-gray-900 text-lg">{name}</h3>
            <p className="text-sm text-messenger-text-secondary">
              {status === 'calling' ? (
                <span className="flex items-center justify-center gap-1">
                  <span>Вызов</span>
                  <span className="animate-pulse">...</span>
                </span>
              ) : formatTime(seconds)}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setMuted(!muted)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                muted ? 'bg-gray-200 text-gray-500' : 'bg-messenger-gray text-gray-700'
              }`}
            >
              <Icon name={muted ? 'MicOff' : 'Mic'} size={20} />
            </button>

            {type === 'video' && (
              <button
                onClick={() => setCameraOff(!cameraOff)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  cameraOff ? 'bg-gray-200 text-gray-500' : 'bg-messenger-gray text-gray-700'
                }`}
              >
                <Icon name={cameraOff ? 'VideoOff' : 'Video'} size={20} />
              </button>
            )}

            <button
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <Icon name="PhoneOff" size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
