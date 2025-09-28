-- Update josue user to super_admin and insert profile
UPDATE public.user_roles 
SET role = 'super_admin' 
WHERE user_id = '641d58e3-3720-422e-aac7-b0acf0899601';

-- Insert profile for josue if not exists (assuming profiles table exists)
INSERT INTO public.profiles (id, email, display_name)
VALUES ('641d58e3-3720-422e-aac7-b0acf0899601', 'josue@festivaldelafamilia.net', 'Josué Admin')
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name;