CREATE TABLE IF NOT EXISTS t_p87324563_messenger_max_app.users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(10) DEFAULT '🧑',
  status VARCHAR(100) DEFAULT 'На связи',
  phone VARCHAR(30),
  email VARCHAR(150),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p87324563_messenger_max_app.sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES t_p87324563_messenger_max_app.users(id),
  token VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON t_p87324563_messenger_max_app.sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON t_p87324563_messenger_max_app.sessions(user_id);
