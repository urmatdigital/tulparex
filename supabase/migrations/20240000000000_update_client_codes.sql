-- Обновляем таблицу client_codes
ALTER TABLE client_codes 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Создаем индекс для оптимизации сортировки
CREATE INDEX IF NOT EXISTS idx_client_codes_created_at ON client_codes(created_at DESC);

-- Добавляем ограничение уникальности для кода
ALTER TABLE client_codes 
ADD CONSTRAINT client_codes_code_unique UNIQUE (code);
