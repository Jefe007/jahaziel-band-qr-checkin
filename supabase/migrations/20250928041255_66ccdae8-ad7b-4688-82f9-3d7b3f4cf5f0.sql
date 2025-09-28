-- Insertar configuración inicial y usuario admin por defecto
INSERT INTO public.event_settings (key, value) 
VALUES ('registration_enabled', 'true') 
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Crear función para insertar usuario admin
CREATE OR REPLACE FUNCTION create_admin_user(admin_email text, admin_password text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Crear usuario en auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    'authenticated'
  ) RETURNING id INTO new_user_id;

  -- Agregar rol de admin
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (new_user_id, 'admin');

  RETURN new_user_id;
END;
$$;

-- Crear usuario admin por defecto
SELECT create_admin_user('admin@jahaziel.com', 'admin123456');

-- Función para forzar registro público (sin autenticación)
CREATE OR REPLACE FUNCTION public.allow_public_registration()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT true;
$$;