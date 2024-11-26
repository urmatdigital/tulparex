-- Добавление индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_client_codes_user_id ON public.client_codes (user_id);
CREATE INDEX IF NOT EXISTS idx_packages_user_id ON public.packages (user_id);
CREATE INDEX IF NOT EXISTS idx_packages_user_status ON public.packages (user_id, status);
CREATE INDEX IF NOT EXISTS idx_telegram_users_user_id ON public.telegram_users (user_id);

-- Добавление CHECK ограничений
ALTER TABLE public.packages 
  ADD CONSTRAINT check_package_status 
  CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled'));

-- Добавление NOT NULL ограничений
ALTER TABLE public.packages ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.packages ALTER COLUMN tracking_number SET NOT NULL;
ALTER TABLE public.packages ALTER COLUMN status SET NOT NULL;
ALTER TABLE public.packages ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE public.client_codes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.client_codes ALTER COLUMN code SET NOT NULL;

ALTER TABLE public.telegram_users ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.telegram_users ALTER COLUMN telegram_id SET NOT NULL;

-- Создание функции для автоматического создания профиля
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создание триггера для автоматического создания профиля
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Создание функции для проверки статуса пакета
CREATE OR REPLACE FUNCTION public.validate_package_status()
RETURNS trigger AS $$
BEGIN
  IF OLD.status = 'delivered' AND NEW.status != 'delivered' THEN
    RAISE EXCEPTION 'Cannot change status of delivered package';
  END IF;
  
  IF OLD.status = 'cancelled' AND NEW.status != 'cancelled' THEN
    RAISE EXCEPTION 'Cannot change status of cancelled package';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание триггера для проверки статуса пакета
DROP TRIGGER IF EXISTS check_package_status_change ON public.packages;
CREATE TRIGGER check_package_status_change
  BEFORE UPDATE ON public.packages
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_package_status();
