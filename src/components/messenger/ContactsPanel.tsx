import Icon from '@/components/ui/icon';

const contacts = [
  { id: 1, name: 'Анна Королёва', status: 'В сети', avatar: '👩', online: true },
  { id: 2, name: 'Артём Белов', status: 'В сети', avatar: '🧑', online: true },
  { id: 3, name: 'Максим Орлов', status: 'В сети', avatar: '👨', online: true },
  { id: 4, name: 'Дима Петров', status: 'Был 2 часа назад', avatar: '👦', online: false },
  { id: 5, name: 'Катя Смирнова', status: 'Была вчера', avatar: '👩‍🦰', online: false },
  { id: 6, name: 'Лена Иванова', status: 'Была 3 дня назад', avatar: '👩‍🦳', online: false },
  { id: 7, name: 'Сергей Козлов', status: 'Был неделю назад', avatar: '🧔', online: false },
];

interface Props {
  onStartChat: (id: number) => void;
  searchQuery: string;
}

export default function ContactsPanel({ onStartChat, searchQuery }: Props) {
  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const online = filtered.filter(c => c.online);
  const offline = filtered.filter(c => !c.online);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Контакты</h2>
        <p className="text-xs text-messenger-text-secondary">{contacts.filter(c => c.online).length} в сети</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {online.length > 0 && (
          <>
            <div className="px-4 py-2 text-xs font-semibold text-messenger-text-secondary uppercase tracking-wider">
              В сети
            </div>
            {online.map(contact => (
              <ContactRow key={contact.id} contact={contact} onChat={() => onStartChat(contact.id)} />
            ))}
          </>
        )}

        {offline.length > 0 && (
          <>
            <div className="px-4 py-2 text-xs font-semibold text-messenger-text-secondary uppercase tracking-wider mt-2">
              Не в сети
            </div>
            {offline.map(contact => (
              <ContactRow key={contact.id} contact={contact} onChat={() => onStartChat(contact.id)} />
            ))}
          </>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-messenger-text-secondary">
            <Icon name="Users" size={32} className="mb-3 opacity-30" />
            <p className="text-sm">Контакты не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ContactRow({ contact, onChat }: { contact: typeof contacts[0]; onChat: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-messenger-gray transition-colors group">
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-messenger-gray-2 flex items-center justify-center text-lg">
          {contact.avatar}
        </div>
        {contact.online && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900">{contact.name}</div>
        <div className="text-xs text-messenger-text-secondary">{contact.status}</div>
      </div>
      <button
        onClick={onChat}
        className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full bg-messenger-blue-light text-messenger-blue flex items-center justify-center transition-all"
      >
        <Icon name="MessageCircle" size={15} />
      </button>
    </div>
  );
}
