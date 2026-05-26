import { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { getMessages, sendMessage as apiSendMessage, Message, ChatUser } from '@/lib/chats';

interface Props {
  chatId: number | null;
  chatUser: ChatUser | null;
  token: string;
  onCall: (type: 'voice' | 'video') => void;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatWindow({ chatId, chatUser, token, onCall }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevChatId = useRef<number | null>(null);

  const loadMessages = useCallback(async (id: number, silent = false) => {
    if (!silent) setLoading(true);
    const res = await getMessages(id, token);
    if (res.ok) setMessages(res.data.messages);
    if (!silent) setLoading(false);
  }, [token]);

  useEffect(() => {
    if (!chatId) { setMessages([]); return; }
    if (prevChatId.current !== chatId) {
      prevChatId.current = chatId;
      loadMessages(chatId);
    }
    const interval = setInterval(() => loadMessages(chatId, true), 3000);
    return () => clearInterval(interval);
  }, [chatId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    if (!input.trim() || !chatId || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    const res = await apiSendMessage(chatId, text, token);
    if (res.ok) setMessages(prev => [...prev, res.data.message]);
    setSending(false);
  };

  if (!chatId || !chatUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-messenger-gray h-full">
        <div className="w-20 h-20 rounded-full bg-messenger-blue-light flex items-center justify-center mb-4">
          <Icon name="MessageCircle" size={36} className="text-messenger-blue" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Выберите чат</h3>
        <p className="text-sm text-messenger-text-secondary">Откройте диалог из списка слева</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-messenger-gray-2 flex items-center justify-center text-xl">
            {chatUser.avatar}
          </div>
          <div>
            <div className="font-semibold text-sm text-gray-900">{chatUser.name}</div>
            <div className="text-xs text-messenger-text-secondary">@{chatUser.username}</div>
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
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-messenger-gray">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-messenger-blue/30 border-t-messenger-blue rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-messenger-text-secondary py-16">
            <p className="text-sm">Начните переписку первым!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.mine
                      ? 'bg-messenger-blue text-white rounded-br-sm'
                      : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                  }`}
                >
                  <p className="break-words">{msg.text}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${msg.mine ? 'text-blue-200' : 'text-messenger-text-secondary'}`}>
                    <span className="text-xs">{formatTime(msg.created_at)}</span>
                    {msg.mine && (
                      <Icon name={msg.is_read ? 'CheckCheck' : 'Check'} size={12} />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2 bg-messenger-gray rounded-2xl px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Сообщение..."
            className="flex-1 bg-transparent text-sm outline-none text-gray-900 placeholder:text-messenger-text-secondary"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              input.trim() && !sending ? 'bg-messenger-blue text-white' : 'text-messenger-text-secondary'
            }`}
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
              <Icon name="Send" size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
