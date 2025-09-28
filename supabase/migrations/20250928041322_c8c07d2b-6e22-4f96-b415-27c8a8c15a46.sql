-- Corregir funciones con search_path y mejorar políticas RLS
DROP FUNCTION IF EXISTS create_admin_user(text, text);

-- Recrear función con search_path correcto
CREATE OR REPLACE FUNCTION create_admin_user(admin_email text, admin_password text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
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

-- Función para permitir registro público
DROP FUNCTION IF EXISTS public.allow_public_registration();

CREATE OR REPLACE FUNCTION public.allow_public_registration()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT true;
$$;

-- Recrear políticas RLS para registrations que permitan operaciones sin autenticación
DROP POLICY IF EXISTS "public_can_register" ON public.registrations;
DROP POLICY IF EXISTS "public_can_read_own" ON public.registrations;
DROP POLICY IF EXISTS "admins_can_read" ON public.registrations;
DROP POLICY IF EXISTS "admins_can_update" ON public.registrations;
DROP POLICY IF EXISTS "admins_can_delete" ON public.registrations;

-- Política para registros públicos (sin autenticación)
CREATE POLICY "public_can_register" 
ON public.registrations 
FOR INSERT 
WITH CHECK (true);

-- Política para lectura pública
CREATE POLICY "public_can_read" 
ON public.registrations 
FOR SELECT 
USING (true);

-- Políticas para administradores autenticados
CREATE POLICY "admins_can_update" 
ON public.registrations 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "admins_can_delete" 
ON public.registrations 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND 
  has_role(auth.uid(), 'admin'::app_role)
);