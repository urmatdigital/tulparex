-- Создаем временную последовательность для генерации кодов
CREATE SEQUENCE IF NOT EXISTS temp_client_code_seq START WITH 7475;

-- Добавляем коды для пользователей, у которых их нет
WITH users_without_codes AS (
  SELECT au.id
  FROM auth.users au
  LEFT JOIN client_codes cc ON au.id = cc.user_id
  WHERE cc.user_id IS NULL
),
numbered_users AS (
  SELECT 
    id,
    'TE-' || nextval('temp_client_code_seq') as new_code
  FROM users_without_codes
)
INSERT INTO client_codes (user_id, code, created_at)
SELECT 
  id,
  new_code,
  CURRENT_TIMESTAMP + (row_number() OVER (ORDER BY id) || ' milliseconds')::interval
FROM numbered_users;

-- Удаляем временную последовательность
DROP SEQUENCE IF EXISTS temp_client_code_seq;
