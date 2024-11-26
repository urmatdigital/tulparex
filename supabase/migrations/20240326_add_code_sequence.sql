-- Создаем последовательность для кодов
CREATE SEQUENCE IF NOT EXISTS public.client_code_seq;

-- Создаем функцию для генерации следующего кода
CREATE OR REPLACE FUNCTION public.generate_client_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    next_num integer;
    code_prefix text := 'TE-';
BEGIN
    -- Получаем следующее значение из последовательности
    SELECT nextval('public.client_code_seq') INTO next_num;
    
    -- Форматируем код с ведущими нулями (4 цифры)
    RETURN code_prefix || LPAD(next_num::text, 4, '0');
END;
$$;

-- Создаем триггер для автоматической генерации кода
CREATE OR REPLACE FUNCTION public.set_client_code()
RETURNS trigger AS $$
BEGIN
    -- Генерируем новый код только если он не был установлен
    IF NEW.code IS NULL THEN
        NEW.code := public.generate_client_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Добавляем триггер к таблице client_codes
DROP TRIGGER IF EXISTS tr_generate_client_code ON public.client_codes;
CREATE TRIGGER tr_generate_client_code
    BEFORE INSERT ON public.client_codes
    FOR EACH ROW
    EXECUTE FUNCTION public.set_client_code();

-- Обновляем последовательность до текущего максимального значения
DO $$
DECLARE
    current_max integer;
BEGIN
    SELECT COALESCE(
        MAX(NULLIF(regexp_replace(code, '[^0-9]', '', 'g'), '')::integer),
        0
    )
    FROM public.client_codes
    INTO current_max;
    
    -- Устанавливаем следующее значение последовательности
    PERFORM setval('public.client_code_seq', current_max, true);
END;
$$;
