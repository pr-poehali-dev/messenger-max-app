import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { searchUsers, openChat, ChatUser } from '@/lib/chats';

interface Props {
  token: string;
  onClose: () => void;
  onChatOpened: (chatId: number, user: ChatUser) => void;
}

export default function NewChatModal({ token, onClose, onChatOpened }: Props) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [opening, setOpening] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!query.trim()) { setUsers([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      const res = await searchUsers(query, token);
      if (res.ok) setUsers(res.data.users);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query, token]);

  const handleOpen = async (user: ChatUser) => {
    setOpening(user.id);
    const res = await openChat(user.id, token);
    if (res.ok) {
      onChatOpened(res.data.chat_id, user);
      onClose();
    }
    setOpening(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
          <div className="flex-1 flex items-center gap-2 bg-messenger-gray rounded-xl px-3 py-2.5">
            <span className="text-messenger-text-secondary text-sm font-medium">@</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value.replace(/\s/g, ''))}
              placeholder="Найти пользователя..."
              className="flex-1 bg-transparent text-sm outline-none text-gray-900 placeholder:text-messenger-text-secondary"
            />
            {loading && (
              <div className="w-4 h-4 border-2 border-messenger-blue/30 border-t-messenger-blue rounded-full animate-spin flex-shrink-0" />
            )}
            {query && !loading && (
              <button onClick={() => setQuery('')}>
                <Icon name="X" size={13} className="text-messenger-text-secondary" />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-messenger-text-secondary hover:bg-messenger-gray transition-colors flex-shrink-0"
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {!query && (
            <div className="flex flex-col items-center py-10 text-messenger-text-secondary">
              <Icon name="Search" size={32} className="mb-3 opacity-20" />
              <p className="text-sm">Введите @ник пользователя</p>
            </div>
          )}

          {query && !loading && users.length === 0 && (
            <div className="flex flex-col items-center py-10 text-messenger-text-secondary">
              <Icon name="UserX" size={32} className="mb-3 opacity-20" />
              <p className="text-sm">Пользователь не найден</p>
            </div>
          )}

          {users.map(user => (
            <button
              key={user.id}
              onClick={() => handleOpen(user)}
              disabled={opening === user.id}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-messenger-gray transition-colors text-left disabled:opacity-60"
            >
              <div className="w-11 h-11 rounded-full bg-messenger-gray-2 flex items-center justify-center text-xl flex-shrink-0">
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900">{user.name}</div>
                <div className="text-xs text-messenger-text-secondary">@{user.username}</div>
              </div>
              {opening === user.id ? (
                <div className="w-4 h-4 border-2 border-messenger-blue/30 border-t-messenger-blue rounded-full animate-spin" />
              ) : (
                <Icon name="MessageCircle" size={18} className="text-messenger-blue flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
