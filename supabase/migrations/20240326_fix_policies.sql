-- Удаляем существующие политики
DROP POLICY IF EXISTS "Users can view own client codes" ON client_codes;
DROP POLICY IF EXISTS "Users can insert own client codes" ON client_codes;
DROP POLICY IF EXISTS "Users can update own client codes" ON client_codes;
DROP POLICY IF EXISTS "Users can view own packages" ON packages;
DROP POLICY IF EXISTS "Users can insert own packages" ON packages;
DROP POLICY IF EXISTS "Users can update own packages" ON packages;
DROP POLICY IF EXISTS "Users can view own telegram user" ON telegram_users;
DROP POLICY IF EXISTS "Users can insert own telegram user" ON telegram_users;
DROP POLICY IF EXISTS "Users can update own telegram user" ON telegram_users;

-- Создаем более простые политики
CREATE POLICY "Enable all for authenticated users" ON client_codes
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON packages
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON telegram_users
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Убеждаемся, что таблицы существуют в публичной схеме
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Включаем расширение для REST API
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Проверяем, что таблицы доступны через REST API
COMMENT ON TABLE client_codes IS 'Client codes table @rest-enabled';
COMMENT ON TABLE packages IS 'Packages table @rest-enabled';
COMMENT ON TABLE telegram_users IS 'Telegram users table @rest-enabled';
