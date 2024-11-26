-- Создаем таблицу profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Включаем RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Создаем политики доступа
CREATE POLICY "Enable read access for all users" ON public.profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for users based on email" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Создаем триггер для обновления updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Предоставляем права доступа
GRANT ALL ON public.profiles TO authenticated;
