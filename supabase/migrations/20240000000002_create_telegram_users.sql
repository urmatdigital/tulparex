-- Создаем таблицу telegram_users, если она не существует
CREATE TABLE IF NOT EXISTS telegram_users (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT telegram_users_user_id_unique UNIQUE (user_id)
);

-- Создаем индекс для оптимизации поиска по user_id
CREATE INDEX IF NOT EXISTS idx_telegram_users_user_id ON telegram_users(user_id);

-- Добавляем триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_telegram_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_telegram_users_updated_at ON telegram_users;
CREATE TRIGGER update_telegram_users_updated_at
  BEFORE UPDATE ON telegram_users
  FOR EACH ROW
  EXECUTE FUNCTION update_telegram_users_updated_at();
