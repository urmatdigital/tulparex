-- Удаляем существующие таблицы
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS client_codes CASCADE;
DROP TABLE IF EXISTS telegram_users CASCADE;

-- Создаем функцию для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создаем таблицу client_codes
CREATE TABLE client_codes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Создаем таблицу packages
CREATE TABLE packages (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tracking_number TEXT NOT NULL,
  status TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Создаем таблицу telegram_users
CREATE TABLE telegram_users (
  id BIGINT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  language_code TEXT,
  is_premium BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Включаем RLS для всех таблиц
ALTER TABLE client_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_users ENABLE ROW LEVEL SECURITY;

-- Политики для client_codes
CREATE POLICY "Users can view own client codes"
  ON client_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client codes"
  ON client_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client codes"
  ON client_codes FOR UPDATE
  USING (auth.uid() = user_id);

-- Политики для packages
CREATE POLICY "Users can view own packages"
  ON packages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own packages"
  ON packages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own packages"
  ON packages FOR UPDATE
  USING (auth.uid() = user_id);

-- Политики для telegram_users
CREATE POLICY "Users can view own telegram user"
  ON telegram_users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own telegram user"
  ON telegram_users FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own telegram user"
  ON telegram_users FOR UPDATE
  USING (auth.uid() = user_id);

-- Создаем триггеры для обновления updated_at
CREATE TRIGGER update_client_codes_updated_at
    BEFORE UPDATE ON client_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at
    BEFORE UPDATE ON packages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_telegram_users_updated_at
    BEFORE UPDATE ON telegram_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Предоставляем права доступа
GRANT ALL ON client_codes TO authenticated;
GRANT ALL ON packages TO authenticated;
GRANT ALL ON telegram_users TO authenticated;
GRANT USAGE ON SEQUENCE client_codes_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE packages_id_seq TO authenticated;
