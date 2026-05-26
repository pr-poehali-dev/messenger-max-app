import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import ChatList from '@/components/messenger/ChatList';
import ChatWindow from '@/components/messenger/ChatWindow';
import NotificationsPanel from '@/components/messenger/NotificationsPanel';
import ProfilePanel from '@/components/messenger/ProfilePanel';
import SettingsPanel from '@/components/messenger/SettingsPanel';
import CallModal from '@/components/messenger/CallModal';
import AuthScreen from '@/components/messenger/AuthScreen';
import NewChatModal from '@/components/messenger/NewChatModal';
import { loadSession, getMe, clearSession, User } from '@/lib/auth';
import { ChatUser } from '@/lib/chats';

type Tab = 'chats' | 'notifications' | 'profile' | 'settings';

export default function Index() {
  const [authState, setAuthState] = useState<'loading' | 'auth' | 'app'>('loading');
  const [token, setToken] = useState('');
  const [user, setUser] = useState<User | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>('chats');
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [activeChatUser, setActiveChatUser] = useState<ChatUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [call, setCall] = useState<{ type: 'voice' | 'video'; name: string; avatar: string } | null>(null);

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

  const handleChatOpened = (chatId: number, chatUser: ChatUser) => {
    setActiveChat(chatId);
    setActiveChatUser(chatUser);
    setActiveTab('chats');
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

  const navItems: { tab: Tab; icon: string; label: string }[] = [
    { tab: 'chats', icon: 'MessageCircle', label: 'Чаты' },
    { tab: 'notifications', icon: 'Bell', label: 'Уведомления' },
    { tab: 'settings', icon: 'Settings', label: 'Настройки' },
    { tab: 'profile', icon: 'User', label: 'Профиль' },
  ];

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden font-sans">

      {/* TOP HEADER */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-messenger-blue flex items-center justify-center shadow-sm">
            <Icon name="Zap" size={16} className="text-white" />
          </div>
          <span className="font-bold text-base text-gray-900">МессенджерМакс</span>
        </div>

        <div className="flex-1" />

        {activeTab === 'chats' && (
          <>
            <div className={`flex items-center gap-2 bg-messenger-gray rounded-xl px-3 py-2 w-44 transition-all ${searchFocused ? 'ring-2 ring-messenger-blue/20' : ''}`}>
              <Icon name="Search" size={14} className="text-messenger-text-secondary flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Поиск..."
                className="flex-1 bg-transparent text-sm outline-none text-gray-900 placeholder:text-messenger-text-secondary min-w-0"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <Icon name="X" size={13} className="text-messenger-text-secondary" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowNewChat(true)}
              className="w-9 h-9 rounded-xl bg-messenger-blue text-white flex items-center justify-center hover:bg-messenger-blue-dark transition-colors shadow-sm flex-shrink-0"
              title="Новый чат"
            >
              <Icon name="Plus" size={18} />
            </button>
          </>
        )}

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-messenger-blue to-blue-400 flex items-center justify-center text-base cursor-default select-none flex-shrink-0">
          {user?.avatar || '🧑'}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chats' && (
          <div className="flex h-full">
            <div className="w-72 flex-shrink-0 border-r border-gray-100 overflow-y-auto">
              <ChatList
                token={token}
                activeChat={activeChat}
                onSelectChat={(id, chatUser) => {
                  setActiveChat(id);
                  setActiveChatUser(chatUser);
                }}
                searchQuery={searchQuery}
              />
            </div>
            <div className="flex-1 min-w-0">
              <ChatWindow
                chatId={activeChat}
                chatUser={activeChatUser}
                token={token}
                onCall={(type) => activeChatUser && setCall({ type, name: activeChatUser.name, avatar: activeChatUser.avatar })}
              />
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="h-full overflow-y-auto">
            <NotificationsPanel />
          </div>
        )}

        {activeTab === 'profile' && user && (
          <div className="h-full overflow-y-auto">
            <ProfilePanel user={user} token={token} onLogout={handleLogout} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="h-full overflow-y-auto">
            <SettingsPanel />
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div className="flex-shrink-0 border-t border-gray-100 bg-white">
        <div className="flex">
          {navItems.map(item => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                activeTab === item.tab
                  ? 'text-messenger-blue'
                  : 'text-messenger-text-secondary hover:text-gray-600'
              }`}
            >
              <div className="relative">
                <Icon name={item.icon} size={22} />
              </div>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
              {activeTab === item.tab && (
                <span className="w-1 h-1 rounded-full bg-messenger-blue" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* New chat modal */}
      {showNewChat && (
        <NewChatModal
          token={token}
          onClose={() => setShowNewChat(false)}
          onChatOpened={handleChatOpened}
        />
      )}

      {/* Call modal */}
      {call && (
        <CallModal
          type={call.type}
          name={call.name}
          avatar={call.avatar}
          onClose={() => setCall(null)}
        />
      )}
    </div>
  );
}