-- Таблица для хранения данных о посылках
CREATE TABLE IF NOT EXISTS packages (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tracking_number TEXT NOT NULL,
  status TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Включаем RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

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

-- Триггер для обновления updated_at
CREATE TRIGGER update_packages_updated_at
    BEFORE UPDATE ON packages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
