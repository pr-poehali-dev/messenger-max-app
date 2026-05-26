import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import ChatList from '@/components/messenger/ChatList';
import ChatWindow from '@/components/messenger/ChatWindow';
import ContactsPanel from '@/components/messenger/ContactsPanel';
import NotificationsPanel from '@/components/messenger/NotificationsPanel';
import ProfilePanel from '@/components/messenger/ProfilePanel';
import SettingsPanel from '@/components/messenger/SettingsPanel';
import CallModal from '@/components/messenger/CallModal';
import AuthScreen from '@/components/messenger/AuthScreen';
import { loadSession, getMe, clearSession, User } from '@/lib/auth';

type Tab = 'chats' | 'contacts' | 'notifications' | 'profile' | 'settings';

const chatAvatars: Record<number, string> = {
  1: '👩', 2: '💼', 3: '👨', 4: '🏠', 5: '👩‍🦰', 6: '🛠', 7: '🧑',
};
const chatNames: Record<number, string> = {
  1: 'Анна Королёва', 2: 'Рабочий чат', 3: 'Максим Орлов',
  4: 'Семья 🏠', 5: 'Катя Смирнова', 6: 'Техподдержка', 7: 'Артём Белов',
};

export default function Index() {
  const [authState, setAuthState] = useState<'loading' | 'auth' | 'app'>('loading');
  const [token, setToken] = useState('');
  const [user, setUser] = useState<User | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>('chats');
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [call, setCall] = useState<{ type: 'voice' | 'video'; chatId: number } | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const session = loadSession();
    if (!session) { setAuthState('auth'); return; }
    getMe(session.token).then(res => {
      if (res.ok) {
        setToken(session.token);
        setUser(res.data.user);
        setAuthState('app');
      } else {
        clearSession();
        setAuthState('auth');
      }
    }).catch(() => {
      setToken(session.token);
      setUser(session.user);
      setAuthState('app');
    });
  }, []);

  const handleAuth = (t: string, u: User) => {
    setToken(t); setUser(u); setAuthState('app');
  };

  const handleLogout = () => {
    setToken(''); setUser(null); setAuthState('auth');
  };

  if (authState === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-messenger-gray">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-messenger-blue flex items-center justify-center shadow-md">
            <Icon name="Zap" size={22} className="text-white" />
          </div>
          <div className="w-5 h-5 border-2 border-messenger-blue/30 border-t-messenger-blue rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (authState === 'auth') {
    return <AuthScreen onAuth={handleAuth} />;
  }

  const navItems: { tab: Tab; icon: string; label: string; badge?: number }[] = [
    { tab: 'chats', icon: 'MessageCircle', label: 'Чаты', badge: 8 },
    { tab: 'contacts', icon: 'Users', label: 'Контакты' },
    { tab: 'notifications', icon: 'Bell', label: 'Уведомления', badge: 3 },
    { tab: 'profile', icon: 'User', label: 'Профиль' },
    { tab: 'settings', icon: 'Settings', label: 'Настройки' },
  ];

  return (
    <div className="h-screen flex bg-white overflow-hidden font-sans">
      {/* Sidebar nav */}
      <div className="w-16 flex flex-col items-center py-4 border-r border-gray-100 bg-white z-10">
        <div className="w-9 h-9 rounded-xl bg-messenger-blue flex items-center justify-center mb-6 shadow-sm">
          <Icon name="Zap" size={18} className="text-white" />
        </div>

        <nav className="flex flex-col items-center gap-1 flex-1">
          {navItems.map(item => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              title={item.label}
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === item.tab
                  ? 'bg-messenger-blue text-white shadow-sm'
                  : 'text-messenger-text-secondary hover:bg-messenger-gray hover:text-gray-700'
              }`}
            >
              <Icon name={item.icon} size={19} />
              {item.badge && activeTab !== item.tab && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <button
            onClick={() => setActiveTab('profile')}
            title="Профиль"
            className="w-9 h-9 rounded-full bg-gradient-to-br from-messenger-blue to-blue-400 flex items-center justify-center text-base hover:opacity-90 transition-opacity"
          >
            {user?.avatar || '🧑'}
          </button>
        </div>
      </div>

      {/* Left panel */}
      <div className="w-72 flex flex-col border-r border-gray-100 bg-white">
        {(activeTab === 'chats' || activeTab === 'contacts') && (
          <div className="px-3 py-3 border-b border-gray-100">
            <div className={`flex items-center gap-2 bg-messenger-gray rounded-xl px-3 py-2 transition-all ${searchFocused ? 'ring-2 ring-messenger-blue/20' : ''}`}>
              <Icon name="Search" size={15} className="text-messenger-text-secondary flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder={activeTab === 'chats' ? 'Поиск чатов...' : 'Поиск контактов...'}
                className="flex-1 bg-transparent text-sm outline-none text-gray-900 placeholder:text-messenger-text-secondary"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-messenger-text-secondary hover:text-gray-600">
                  <Icon name="X" size={13} />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'chats' && (
            <ChatList activeChat={activeChat} onSelectChat={setActiveChat} searchQuery={searchQuery} />
          )}
          {activeTab === 'contacts' && (
            <ContactsPanel onStartChat={(id) => { setActiveChat(id); setActiveTab('chats'); }} searchQuery={searchQuery} />
          )}
          {activeTab === 'notifications' && <NotificationsPanel />}
          {activeTab === 'profile' && user && (
            <ProfilePanel user={user} token={token} onLogout={handleLogout} />
          )}
          {activeTab === 'settings' && <SettingsPanel />}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeTab === 'chats' ? (
          <ChatWindow
            chatId={activeChat}
            onCall={(type) => activeChat && setCall({ type, chatId: activeChat })}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-messenger-gray">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm">
              <Icon
                name={navItems.find(n => n.tab === activeTab)?.icon || 'MessageCircle'}
                size={28}
                className="text-messenger-blue"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {navItems.find(n => n.tab === activeTab)?.label}
            </h3>
            <p className="text-sm text-messenger-text-secondary">
              {activeTab === 'contacts' && 'Выберите контакт, чтобы начать диалог'}
              {activeTab === 'notifications' && 'Все уведомления отображаются слева'}
              {activeTab === 'profile' && 'Управляйте профилем в левой панели'}
              {activeTab === 'settings' && 'Настройте приложение в левой панели'}
            </p>
          </div>
        )}
      </div>

      {/* Call modal */}
      {call && (
        <CallModal
          type={call.type}
          name={chatNames[call.chatId] || 'Пользователь'}
          avatar={chatAvatars[call.chatId] || '👤'}
          onClose={() => setCall(null)}
        />
      )}
    </div>
  );
}
