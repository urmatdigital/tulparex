-- Создаем функцию для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создаем таблицу profiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Создаем таблицу client_codes
CREATE TABLE public.client_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Создаем таблицу packages
CREATE TABLE public.packages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    tracking_number TEXT,
    status TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Создаем таблицу telegram_users
CREATE TABLE public.telegram_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    telegram_id BIGINT UNIQUE,
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Включаем Row Level Security для всех таблиц
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;

-- Создаем политики доступа для profiles
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Создаем политики доступа для client_codes
CREATE POLICY "Users can view their own codes"
    ON public.client_codes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own codes"
    ON public.client_codes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own codes"
    ON public.client_codes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own codes"
    ON public.client_codes FOR DELETE
    USING (auth.uid() = user_id);

-- Создаем политики доступа для packages
CREATE POLICY "Users can view their own packages"
    ON public.packages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own packages"
    ON public.packages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own packages"
    ON public.packages FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own packages"
    ON public.packages FOR DELETE
    USING (auth.uid() = user_id);

-- Создаем политики доступа для telegram_users
CREATE POLICY "Users can view their own telegram info"
    ON public.telegram_users FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own telegram info"
    ON public.telegram_users FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own telegram info"
    ON public.telegram_users FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own telegram info"
    ON public.telegram_users FOR DELETE
    USING (auth.uid() = user_id);

-- Создаем триггеры для обновления updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_codes_updated_at
    BEFORE UPDATE ON public.client_codes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_packages_updated_at
    BEFORE UPDATE ON public.packages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_telegram_users_updated_at
    BEFORE UPDATE ON public.telegram_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Предоставляем права доступа
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.client_codes TO authenticated;
GRANT ALL ON public.packages TO authenticated;
GRANT ALL ON public.telegram_users TO authenticated;
