-- Function to create a new user with role
CREATE OR REPLACE FUNCTION public.create_user_with_role(
  user_email text,
  user_password text,
  user_role app_role,
  user_display_name text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Create user in auth.users
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
    user_email,
    crypt(user_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    COALESCE('{"display_name":"' || user_display_name || '"}', '{}'),
    false,
    'authenticated'
  ) RETURNING id INTO new_user_id;

  -- Add role
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (new_user_id, user_role);

  -- Add profile
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new_user_id, user_email, user_display_name);

  RETURN new_user_id;
END;
$$;

-- Function to delete user and all related data
CREATE OR REPLACE FUNCTION public.delete_user_completely(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
  -- Delete from profiles (will cascade due to foreign key)
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  -- Delete from user_roles
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  -- Delete from auth.users
  DELETE FROM auth.users WHERE id = target_user_id;
  
  RETURN true;
END;
$$;