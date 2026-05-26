CREATE TABLE IF NOT EXISTS t_p87324563_messenger_max_app.chats (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p87324563_messenger_max_app.chat_members (
  chat_id INTEGER NOT NULL REFERENCES t_p87324563_messenger_max_app.chats(id),
  user_id INTEGER NOT NULL REFERENCES t_p87324563_messenger_max_app.users(id),
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS t_p87324563_messenger_max_app.messages (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER NOT NULL REFERENCES t_p87324563_messenger_max_app.chats(id),
  sender_id INTEGER NOT NULL REFERENCES t_p87324563_messenger_max_app.users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON t_p87324563_messenger_max_app.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON t_p87324563_messenger_max_app.chat_members(user_id);
