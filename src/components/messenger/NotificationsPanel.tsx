import Icon from '@/components/ui/icon';

const notifications = [
  { id: 1, type: 'message', text: 'Анна Королёва: Окей, жду тебя в 18:00!', time: '14:32', read: false, avatar: '👩' },
  { id: 2, type: 'message', text: 'Рабочий чат: 5 новых сообщений', time: '13:15', read: false, avatar: '💼' },
  { id: 3, type: 'call', text: 'Пропущенный вызов от Максим Орлов', time: '11:40', read: false, avatar: '👨' },
  { id: 4, type: 'message', text: 'Семья 🏠: Мама написала сообщение', time: 'вчера', read: true, avatar: '🏠' },
  { id: 5, type: 'system', text: 'Артём Белов добавил вас в контакты', time: 'вчера', read: true, avatar: '🧑' },
  { id: 6, type: 'call', text: 'Видеозвонок с Катя Смирнова — 5 мин', time: 'пн', read: true, avatar: '👩‍🦰' },
];

export default function NotificationsPanel() {
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Уведомления</h2>
          {unread > 0 && <p className="text-xs text-messenger-text-secondary">{unread} непрочитанных</p>}
        </div>
        {unread > 0 && (
          <button className="text-xs text-messenger-blue font-medium hover:underline">
            Прочитать все
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`flex items-start gap-3 px-4 py-3 hover:bg-messenger-gray transition-colors ${
              !n.read ? 'bg-messenger-blue-light/40' : ''
            }`}
          >
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-messenger-gray-2 flex items-center justify-center text-lg">
                {n.avatar}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                n.type === 'message' ? 'bg-messenger-blue' :
                n.type === 'call' ? 'bg-red-500' : 'bg-gray-400'
              }`}>
                <Icon
                  name={n.type === 'message' ? 'MessageCircle' : n.type === 'call' ? 'Phone' : 'Info'}
                  size={10}
                  className="text-white"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-snug ${!n.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                {n.text}
              </p>
              <p className="text-xs text-messenger-text-secondary mt-0.5">{n.time}</p>
            </div>
            {!n.read && (
              <div className="w-2 h-2 rounded-full bg-messenger-blue flex-shrink-0 mt-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
