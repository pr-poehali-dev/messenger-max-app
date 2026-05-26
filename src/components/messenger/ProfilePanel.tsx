import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { logout, deleteAccount, clearSession, User } from '@/lib/auth';

interface Props {
  user: User;
  token: string;
  onLogout: () => void;
}

export default function ProfilePanel({ user, token, onLogout }: Props) {
  const [name, setName] = useState(user.name);
  const [status, setStatus] = useState(user.status || 'На связи');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logout(token);
    clearSession();
    onLogout();
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    await deleteAccount(token);
    clearSession();
    onLogout();
  };

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
              {user.avatar}
            </div>
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
              <p className="text-sm text-messenger-text-secondary mt-0.5">@{user.username}</p>
              <p className="text-sm text-green-500 mt-0.5">{status}</p>
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
          <div className="text-xs font-semibold text-messenger-text-secondary uppercase tracking-wider px-1 mb-2">Аккаунт</div>
          <InfoRow icon="AtSign" label="Имя пользователя" value={`@${user.username}`} />
          <InfoRow icon="Hash" label="ID пользователя" value={`#${user.id}`} />
        </div>

        {/* Actions */}
        <div className="px-4 space-y-1 mb-4">
          <div className="text-xs font-semibold text-messenger-text-secondary uppercase tracking-wider px-1 mb-2">Настройки</div>
          <ActionRow icon="Shield" label="Приватность и безопасность" />
          <ActionRow icon="Bell" label="Управление уведомлениями" />
          <ActionRow icon="Smartphone" label="Устройства" />
          <ActionRow icon="HelpCircle" label="Помощь" />
        </div>

        {/* Logout / Delete */}
        <div className="px-4 mt-2 mb-4 space-y-2">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-messenger-blue bg-messenger-blue-light hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-60"
          >
            <Icon name="LogOut" size={16} />
            Выйти из аккаунта
          </button>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 transition-colors text-sm font-medium"
            >
              <Icon name="Trash2" size={16} />
              Удалить аккаунт
            </button>
          ) : (
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <p className="text-sm font-semibold text-red-700 mb-1">Удалить аккаунт?</p>
              <p className="text-xs text-red-500 mb-3">Это действие необратимо. Все данные будут удалены.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  {loading ? 'Удаляем...' : 'Удалить'}
                </button>
              </div>
            </div>
          )}
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
