import { useEffect, useState, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { getChats, Chat, ChatUser } from '@/lib/chats';

interface Props {
  token: string;
  activeChat: number | null;
  onSelectChat: (id: number, user: ChatUser) => void;
  searchQuery: string;
}

function formatTime(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000 && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
  }
  if (diff < 86400000 * 2) return 'вчера';
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'short' });
}

export default function ChatList({ token, activeChat, onSelectChat, searchQuery }: Props) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await getChats(token);
    if (res.ok) setChats(res.data.chats);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = chats.filter(c =>
    c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 px-2 py-2 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-messenger-gray flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-messenger-gray rounded w-3/4" />
              <div className="h-3 bg-messenger-gray rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center text-messenger-text-secondary">
        <div className="w-14 h-14 rounded-2xl bg-messenger-blue-light flex items-center justify-center mb-4">
          <Icon name="MessageCircle" size={26} className="text-messenger-blue" />
        </div>
        {searchQuery ? (
          <p className="text-sm">Ничего не найдено</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700 mb-1">Пока нет чатов</p>
            <p className="text-xs leading-relaxed">Нажмите + чтобы найти пользователя<br/>и начать переписку</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {filtered.map(chat => (
        <button
          key={chat.id}
          onClick={() => onSelectChat(chat.id, chat.user)}
          className={`flex items-center gap-3 px-4 py-3 hover:bg-messenger-gray transition-colors text-left ${
            activeChat === chat.id ? 'bg-messenger-blue-light' : ''
          }`}
        >
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-messenger-gray-2 flex items-center justify-center text-xl">
              {chat.user.avatar}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-semibold text-sm text-gray-900 truncate">{chat.user.name}</span>
              <span className="text-xs text-messenger-text-secondary flex-shrink-0 ml-2">{formatTime(chat.last_time)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-messenger-text-secondary truncate">
                {chat.last_message || <span className="italic">Нет сообщений</span>}
              </span>
              {chat.unread > 0 && (
                <span className="ml-2 flex-shrink-0 min-w-5 h-5 px-1 bg-messenger-blue text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {chat.unread > 99 ? '99+' : chat.unread}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}