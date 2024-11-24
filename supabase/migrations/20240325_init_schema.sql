-- Таблица для хранения данных Telegram пользователей
CREATE TABLE IF NOT EXISTS telegram_users (
  id BIGINT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  language_code TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Таблица для хранения сообщений чата
CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  telegram_user_id BIGINT REFERENCES telegram_users(id),
  message TEXT NOT NULL,
  direction TEXT CHECK (direction IN ('incoming', 'outgoing')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Таблица для хранения клиентских кодов
CREATE TABLE IF NOT EXISTS client_codes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для обновления updated_at в telegram_users
CREATE TRIGGER update_telegram_users_updated_at
    BEFORE UPDATE ON telegram_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Создаем RLS политики
ALTER TABLE telegram_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_codes ENABLE ROW LEVEL SECURITY;

-- Политики для telegram_users
CREATE POLICY "Users can view own telegram data"
  ON telegram_users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own telegram data"
  ON telegram_users FOR UPDATE
  USING (auth.uid() = user_id);

-- Политики для chat_messages
CREATE POLICY "Users can view own messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Политики для client_codes
CREATE POLICY "Users can view own codes"
  ON client_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own codes"
  ON client_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
