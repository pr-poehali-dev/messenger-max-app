import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface Message {
  id: number;
  text: string;
  mine: boolean;
  time: string;
  read: boolean;
}

const mockMessages: Message[] = [
  { id: 1, text: 'Привет! Как дела?', mine: false, time: '13:45', read: true },
  { id: 2, text: 'Привет! Всё отлично, спасибо! А у тебя?', mine: true, time: '13:46', read: true },
  { id: 3, text: 'Тоже хорошо 😊 Ты сегодня свободен вечером?', mine: false, time: '13:47', read: true },
  { id: 4, text: 'Да, с 18:00 точно свободен. Что-то планируешь?', mine: true, time: '13:48', read: true },
  { id: 5, text: 'Окей, жду тебя в 18:00!', mine: false, time: '14:32', read: false },
];

interface Props {
  chatId: number | null;
  onCall: (type: 'voice' | 'video') => void;
}

const chatNames: Record<number, string> = {
  1: 'Анна Королёва',
  2: 'Рабочий чат',
  3: 'Максим Орлов',
  4: 'Семья 🏠',
  5: 'Катя Смирнова',
  6: 'Техподдержка',
  7: 'Артём Белов',
};

const chatAvatars: Record<number, string> = {
  1: '👩', 2: '💼', 3: '👨', 4: '🏠', 5: '👩‍🦰', 6: '🛠', 7: '🧑',
};

export default function ChatWindow({ chatId, onCall }: Props) {
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState('');

  if (!chatId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-messenger-gray">
        <div className="w-20 h-20 rounded-full bg-messenger-blue-light flex items-center justify-center mb-4">
          <Icon name="MessageCircle" size={36} className="text-messenger-blue" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Выберите чат</h3>
        <p className="text-sm text-messenger-text-secondary">Откройте диалог из списка слева</p>
      </div>
    );
  }

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: input.trim(),
      mine: true,
      time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    }]);
    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-messenger-gray-2 flex items-center justify-center text-lg">
            {chatAvatars[chatId]}
          </div>
          <div>
            <div className="font-semibold text-sm text-gray-900">{chatNames[chatId]}</div>
            <div className="text-xs text-green-500">в сети</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onCall('voice')}
            className="w-9 h-9 rounded-full hover:bg-messenger-gray flex items-center justify-center transition-colors"
          >
            <Icon name="Phone" size={18} className="text-messenger-text-secondary" />
          </button>
          <button
            onClick={() => onCall('video')}
            className="w-9 h-9 rounded-full hover:bg-messenger-gray flex items-center justify-center transition-colors"
          >
            <Icon name="Video" size={18} className="text-messenger-text-secondary" />
          </button>
          <button className="w-9 h-9 rounded-full hover:bg-messenger-gray flex items-center justify-center transition-colors">
            <Icon name="MoreVertical" size={18} className="text-messenger-text-secondary" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-messenger-gray">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.mine ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                msg.mine
                  ? 'bg-messenger-blue text-white rounded-br-sm'
                  : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
              }`}
            >
              <p>{msg.text}</p>
              <div className={`flex items-center justify-end gap-1 mt-1 ${msg.mine ? 'text-blue-200' : 'text-messenger-text-secondary'}`}>
                <span className="text-xs">{msg.time}</span>
                {msg.mine && (
                  <Icon name={msg.read ? 'CheckCheck' : 'Check'} size={12} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2 bg-messenger-gray rounded-2xl px-4 py-2">
          <button className="text-messenger-text-secondary hover:text-messenger-blue transition-colors">
            <Icon name="Smile" size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Сообщение..."
            className="flex-1 bg-transparent text-sm outline-none text-gray-900 placeholder:text-messenger-text-secondary"
          />
          <button className="text-messenger-text-secondary hover:text-messenger-blue transition-colors">
            <Icon name="Paperclip" size={20} />
          </button>
          <button
            onClick={sendMessage}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              input.trim() ? 'bg-messenger-blue text-white' : 'text-messenger-text-secondary'
            }`}
          >
            <Icon name="Send" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
