import { useState } from 'react';
import Icon from '@/components/ui/icon';

export default function ProfilePanel() {
  const [name, setName] = useState('Александр Новиков');
  const [status, setStatus] = useState('На связи');
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Профиль</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Avatar block */}
        <div className="flex flex-col items-center pt-8 pb-6 px-4">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-messenger-blue to-blue-400 flex items-center justify-center text-4xl shadow-lg">
              🧑‍💻
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-messenger-blue text-white flex items-center justify-center shadow-md hover:bg-messenger-blue-dark transition-colors">
              <Icon name="Camera" size={14} />
            </button>
          </div>

          {editing ? (
            <div className="flex flex-col items-center gap-2 w-full max-w-xs">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="text-center font-bold text-lg text-gray-900 border-b-2 border-messenger-blue outline-none bg-transparent w-full"
              />
              <input
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="text-center text-sm text-messenger-text-secondary border-b border-gray-200 outline-none bg-transparent w-full"
              />
              <button
                onClick={() => setEditing(false)}
                className="mt-2 px-6 py-2 bg-messenger-blue text-white text-sm rounded-full font-medium hover:bg-messenger-blue-dark transition-colors"
              >
                Сохранить
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <h3 className="font-bold text-xl text-gray-900">{name}</h3>
              <p className="text-sm text-messenger-text-secondary mt-1">{status}</p>
              <button
                onClick={() => setEditing(true)}
                className="mt-3 flex items-center gap-1.5 text-sm text-messenger-blue font-medium hover:underline"
              >
                <Icon name="Pencil" size={13} />
                Редактировать
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-4 space-y-1 mb-4">
          <div className="text-xs font-semibold text-messenger-text-secondary uppercase tracking-wider px-1 mb-2">Информация</div>
          <InfoRow icon="Phone" label="Телефон" value="+7 900 123-45-67" />
          <InfoRow icon="Mail" label="Email" value="alex@example.com" />
          <InfoRow icon="MapPin" label="Город" value="Москва" />
        </div>

        {/* Quick actions */}
        <div className="px-4 space-y-1">
          <div className="text-xs font-semibold text-messenger-text-secondary uppercase tracking-wider px-1 mb-2">Аккаунт</div>
          <ActionRow icon="Shield" label="Приватность и безопасность" />
          <ActionRow icon="Bell" label="Управление уведомлениями" />
          <ActionRow icon="Smartphone" label="Устройства" />
          <ActionRow icon="HelpCircle" label="Помощь" />
        </div>

        <div className="px-4 mt-6 mb-8">
          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 transition-colors text-sm font-medium">
            <Icon name="LogOut" size={16} />
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-messenger-gray transition-colors">
      <div className="w-8 h-8 rounded-full bg-messenger-blue-light flex items-center justify-center flex-shrink-0">
        <Icon name={icon} size={15} className="text-messenger-blue" />
      </div>
      <div className="flex-1">
        <div className="text-xs text-messenger-text-secondary">{label}</div>
        <div className="text-sm font-medium text-gray-900">{value}</div>
      </div>
    </div>
  );
}

function ActionRow({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-messenger-gray transition-colors text-left">
      <div className="w-8 h-8 rounded-full bg-messenger-gray-2 flex items-center justify-center flex-shrink-0">
        <Icon name={icon} size={15} className="text-gray-600" />
      </div>
      <span className="text-sm text-gray-800 flex-1">{label}</span>
      <Icon name="ChevronRight" size={16} className="text-messenger-text-secondary" />
    </button>
  );
}
