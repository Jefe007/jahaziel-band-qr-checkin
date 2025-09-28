-- Update the password for the super admin user
UPDATE auth.users 
SET encrypted_password = crypt('admin123', gen_salt('bf'))
WHERE email = 'josue@festivaldelafamilia.net';