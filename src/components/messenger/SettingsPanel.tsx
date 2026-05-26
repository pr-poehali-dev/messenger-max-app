import { useState } from 'react';
import Icon from '@/components/ui/icon';

export default function SettingsPanel() {
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Настройки</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <Section title="Уведомления">
          <Toggle label="Push-уведомления" desc="Сообщения и звонки" value={notifications} onChange={setNotifications} />
          <Toggle label="Звуки" desc="Сигналы при сообщениях" value={sounds} onChange={setSounds} />
        </Section>

        <Section title="Приватность">
          <Toggle label="Подтверждение прочтения" desc="Показывать, что прочитали" value={readReceipts} onChange={setReadReceipts} />
          <Toggle label="Статус «В сети»" desc="Видно другим пользователям" value={onlineStatus} onChange={setOnlineStatus} />
        </Section>

        <Section title="Внешний вид">
          <Toggle label="Тёмная тема" desc="Тёмный режим интерфейса" value={darkMode} onChange={setDarkMode} />
          <div className="px-3 py-3 rounded-xl hover:bg-messenger-gray transition-colors">
            <div className="text-sm font-medium text-gray-800 mb-2">Размер шрифта</div>
            <div className="flex items-center gap-2">
              {['Маленький', 'Обычный', 'Крупный'].map((size, i) => (
                <button
                  key={size}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    i === 1 ? 'bg-messenger-blue text-white' : 'bg-messenger-gray-2 text-gray-600 hover:bg-messenger-gray'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Звонки">
          <SettingRow icon="Shield" label="Шифрование" desc="End-to-end для всех звонков" active />
          <SettingRow icon="Wifi" label="Качество" desc="HD видео при хорошем сигнале" />
          <SettingRow icon="Mic" label="Шумоподавление" desc="Фильтрация фонового шума" />
        </Section>

        <Section title="Данные">
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-messenger-gray transition-colors text-left">
            <div className="w-8 h-8 rounded-full bg-messenger-gray-2 flex items-center justify-center">
              <Icon name="Download" size={15} className="text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">Экспорт данных</div>
              <div className="text-xs text-messenger-text-secondary">Скачать историю чатов</div>
            </div>
            <Icon name="ChevronRight" size={16} className="text-messenger-text-secondary" />
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 transition-colors text-left">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <Icon name="Trash2" size={15} className="text-red-500" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-red-600">Удалить аккаунт</div>
              <div className="text-xs text-messenger-text-secondary">Необратимое действие</div>
            </div>
          </button>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-messenger-text-secondary uppercase tracking-wider px-1 mb-2">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Toggle({ label, desc, value, onChange }: {
  label: string; desc: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-messenger-gray transition-colors">
      <div>
        <div className="text-sm font-medium text-gray-800">{label}</div>
        <div className="text-xs text-messenger-text-secondary">{desc}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-messenger-blue' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

function SettingRow({ icon, label, desc, active }: { icon: string; label: string; desc: string; active?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-messenger-gray transition-colors">
      <div className="w-8 h-8 rounded-full bg-messenger-gray-2 flex items-center justify-center">
        <Icon name={icon} size={15} className={active ? 'text-messenger-blue' : 'text-gray-600'} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-800">{label}</div>
        <div className="text-xs text-messenger-text-secondary">{desc}</div>
      </div>
      {active && (
        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">Вкл</span>
      )}
    </div>
  );
}
