-- Создаем тестовых пользователей в auth.users если их еще нет
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid,
  'system@example.com',
  crypt('system123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now(),
  'authenticated',
  'authenticated',
  ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000000'
);

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
SELECT 
  '2a743f89-4e19-4450-965b-be4cfac3d12b'::uuid,
  'urmatdigital@gmail.com',
  crypt('Aux321654987*', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now(),
  'authenticated',
  'authenticated',
  ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE id = '2a743f89-4e19-4450-965b-be4cfac3d12b'
);

-- Удаляем существующую таблицу, если она есть
DROP TABLE IF EXISTS client_codes CASCADE;

-- Создаем таблицу заново
CREATE TABLE client_codes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Добавляем тестовые клиентские коды для системного пользователя
INSERT INTO client_codes (code, description, is_active, user_id)
VALUES 
  ('TE-6507', 'Тестовый клиент 1', true, '00000000-0000-0000-0000-000000000000'),
  ('TE-6508', 'Тестовый клиент 2', true, '00000000-0000-0000-0000-000000000000'),
  ('TE-6509', 'Тестовый клиент 3', true, '00000000-0000-0000-0000-000000000000'),
  ('TE-6510', 'Неактивный клиент', false, '00000000-0000-0000-0000-000000000000');

-- Добавляем код для реального пользователя
INSERT INTO client_codes (code, description, is_active, user_id)
VALUES 
  ('TE-6511', 'Urmat Digital', true, '2a743f89-4e19-4450-965b-be4cfac3d12b');

-- Включаем RLS
ALTER TABLE client_codes ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики, если они существуют
DROP POLICY IF EXISTS "Everyone can view active client codes" ON client_codes;
DROP POLICY IF EXISTS "Authenticated users can insert client codes" ON client_codes;
DROP POLICY IF EXISTS "Authenticated users can update client codes" ON client_codes;
DROP POLICY IF EXISTS "Users can view own client codes" ON client_codes;

-- Создаем новые политики доступа
CREATE POLICY "Users can view own client codes"
  ON client_codes FOR SELECT
  USING (
    auth.uid() = user_id OR 
    user_id = '00000000-0000-0000-0000-000000000000'
  );

CREATE POLICY "Users can insert own client codes"
  ON client_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client codes"
  ON client_codes FOR UPDATE
  USING (auth.uid() = user_id);

-- Предоставляем права доступа
GRANT ALL ON client_codes TO authenticated;
GRANT USAGE ON SEQUENCE client_codes_id_seq TO authenticated;

-- Создаем или обновляем функцию для updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создаем триггер для обновления updated_at
DROP TRIGGER IF EXISTS update_client_codes_updated_at ON client_codes;
CREATE TRIGGER update_client_codes_updated_at
    BEFORE UPDATE ON client_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
