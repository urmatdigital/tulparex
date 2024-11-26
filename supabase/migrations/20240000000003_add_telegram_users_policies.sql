-- Политики для таблицы telegram_users

-- Политика на чтение: пользователь может читать только свои записи
CREATE POLICY "Users can view own telegram settings"
ON telegram_users FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Политика на вставку: пользователь может создавать записи только для себя
CREATE POLICY "Users can create own telegram settings"
ON telegram_users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Политика на обновление: пользователь может обновлять только свои записи
CREATE POLICY "Users can update own telegram settings"
ON telegram_users FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Включаем RLS для таблицы
ALTER TABLE telegram_users ENABLE ROW LEVEL SECURITY;
