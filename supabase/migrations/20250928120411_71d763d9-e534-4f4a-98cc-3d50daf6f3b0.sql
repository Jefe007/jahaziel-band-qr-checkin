-- Create a simpler user creation function that uses Supabase Auth API
CREATE OR REPLACE FUNCTION public.create_user_with_role_simple(user_email text, user_role app_role, user_display_name text DEFAULT NULL::text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result json;
BEGIN
  -- Return the data needed for the client to create the user
  SELECT json_build_object(
    'email', user_email,
    'role', user_role,
    'display_name', user_display_name,
    'success', true
  ) INTO result;
  
  RETURN result;
END;
$function$;