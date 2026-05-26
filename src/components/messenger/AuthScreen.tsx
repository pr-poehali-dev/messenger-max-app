import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { register, login, saveSession, User } from '@/lib/auth';

interface Props {
  onAuth: (token: string, user: User) => void;
}

const AVATARS = ['🧑', '👩', '👨', '🧔', '👩‍🦰', '👩‍🦳', '🧑‍💻', '👦', '👧', '🦸'];

export default function AuthScreen({ onAuth }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('🧑');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const submit = async () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Заполните все поля');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Введите имя');
      return;
    }
    setLoading(true);
    try {
      const res = mode === 'register'
        ? await register(name.trim(), username.trim(), password, avatar)
        : await login(username.trim(), password);

      if (!res.ok) {
        setError(res.data.error || 'Произошла ошибка');
      } else {
        saveSession(res.data.token, res.data.user);
        onAuth(res.data.token, res.data.user);
      }
    } catch {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-messenger-gray">
      <div className="w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-messenger-blue flex items-center justify-center mb-3 shadow-lg">
            <Icon name="Zap" size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">МессенджерМакс</h1>
          <p className="text-sm text-messenger-text-secondary mt-1">
            {mode === 'login' ? 'Войдите в аккаунт' : 'Создайте аккаунт'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {/* Avatar picker — only register */}
          {mode === 'register' && (
            <div className="mb-4">
              <label className="text-xs font-semibold text-messenger-text-secondary uppercase tracking-wider mb-2 block">
                Выберите аватар
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map(a => (
                  <button
                    key={a}
                    onClick={() => setAvatar(a)}
                    className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                      avatar === a
                        ? 'bg-messenger-blue shadow-sm scale-110'
                        : 'bg-messenger-gray hover:bg-messenger-gray-2'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Name — only register */}
          {mode === 'register' && (
            <div className="mb-3">
              <label className="text-xs font-semibold text-messenger-text-secondary uppercase tracking-wider mb-1.5 block">
                Имя
              </label>
              <div className="flex items-center gap-2 bg-messenger-gray rounded-xl px-3 py-2.5">
                <Icon name="User" size={16} className="text-messenger-text-secondary flex-shrink-0" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ваше имя"
                  className="flex-1 bg-transparent text-sm outline-none text-gray-900 placeholder:text-messenger-text-secondary"
                />
              </div>
            </div>
          )}

          {/* Username */}
          <div className="mb-3">
            <label className="text-xs font-semibold text-messenger-text-secondary uppercase tracking-wider mb-1.5 block">
              Имя пользователя
            </label>
            <div className="flex items-center gap-2 bg-messenger-gray rounded-xl px-3 py-2.5">
              <span className="text-messenger-text-secondary text-sm font-medium">@</span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.replace(/\s/g, ''))}
                onKeyDown={e => e.key === 'Enter' && submit()}
                placeholder="username"
                autoComplete="username"
                className="flex-1 bg-transparent text-sm outline-none text-gray-900 placeholder:text-messenger-text-secondary"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-messenger-text-secondary uppercase tracking-wider mb-1.5 block">
              Пароль
            </label>
            <div className="flex items-center gap-2 bg-messenger-gray rounded-xl px-3 py-2.5">
              <Icon name="Lock" size={16} className="text-messenger-text-secondary flex-shrink-0" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                placeholder={mode === 'register' ? 'Минимум 6 символов' : 'Ваш пароль'}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                className="flex-1 bg-transparent text-sm outline-none text-gray-900 placeholder:text-messenger-text-secondary"
              />
              <button
                onClick={() => setShowPass(v => !v)}
                className="text-messenger-text-secondary hover:text-gray-600 flex-shrink-0"
              >
                <Icon name={showPass ? 'EyeOff' : 'Eye'} size={15} />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 flex items-center gap-2 bg-red-50 text-red-600 rounded-xl px-3 py-2.5 text-sm">
              <Icon name="AlertCircle" size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={submit}
            disabled={loading}
            className="w-full py-3 bg-messenger-blue text-white rounded-xl font-semibold text-sm hover:bg-messenger-blue-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{mode === 'login' ? 'Входим...' : 'Регистрируем...'}</span>
              </>
            ) : (
              mode === 'login' ? 'Войти' : 'Зарегистрироваться'
            )}
          </button>
        </div>

        {/* Switch mode */}
        <div className="text-center mt-4">
          <span className="text-sm text-messenger-text-secondary">
            {mode === 'login' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          </span>
          <button
            onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-sm text-messenger-blue font-semibold hover:underline"
          >
            {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </div>
      </div>
    </div>
  );
}
