import Icon from '@/components/ui/icon';

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

const chats: Chat[] = [
  { id: 1, name: 'Анна Королёва', avatar: '👩', lastMessage: 'Окей, жду тебя в 18:00!', time: '14:32', unread: 2, online: true },
  { id: 2, name: 'Рабочий чат', avatar: '💼', lastMessage: 'Дима: презентация готова', time: '13:15', unread: 5, online: false },
  { id: 3, name: 'Максим Орлов', avatar: '👨', lastMessage: 'Видел новый фильм?', time: '12:04', unread: 0, online: true },
  { id: 4, name: 'Семья 🏠', avatar: '🏠', lastMessage: 'Мама: Приедешь в воскресенье?', time: 'вчера', unread: 1, online: false },
  { id: 5, name: 'Катя Смирнова', avatar: '👩‍🦰', lastMessage: 'Спасибо за помощь!', time: 'вчера', unread: 0, online: false },
  { id: 6, name: 'Техподдержка', avatar: '🛠', lastMessage: 'Ваш запрос обработан', time: 'пн', unread: 0, online: false },
  { id: 7, name: 'Артём Белов', avatar: '🧑', lastMessage: 'Скидываю файлы сейчас', time: 'пн', unread: 0, online: true },
];

interface Props {
  activeChat: number | null;
  onSelectChat: (id: number) => void;
  searchQuery: string;
}

export default function ChatList({ activeChat, onSelectChat, searchQuery }: Props) {
  const filtered = chats.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      {filtered.map(chat => (
        <button
          key={chat.id}
          onClick={() => onSelectChat(chat.id)}
          className={`flex items-center gap-3 px-4 py-3 hover:bg-messenger-gray transition-colors text-left ${
            activeChat === chat.id ? 'bg-messenger-blue-light' : ''
          }`}
        >
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-messenger-gray-2 flex items-center justify-center text-xl">
              {chat.avatar}
            </div>
            {chat.online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-semibold text-sm text-gray-900 truncate">{chat.name}</span>
              <span className="text-xs text-messenger-text-secondary flex-shrink-0 ml-2">{chat.time}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-messenger-text-secondary truncate">{chat.lastMessage}</span>
              {chat.unread > 0 && (
                <span className="ml-2 flex-shrink-0 w-5 h-5 bg-messenger-blue text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {chat.unread}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-messenger-text-secondary">
          <Icon name="Search" size={32} className="mb-3 opacity-30" />
          <p className="text-sm">Ничего не найдено</p>
        </div>
      )}
    </div>
  );
}
