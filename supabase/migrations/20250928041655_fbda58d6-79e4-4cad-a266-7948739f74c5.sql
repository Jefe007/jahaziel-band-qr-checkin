-- Asignar rol de admin al usuario actual que está autenticado
INSERT INTO public.user_roles (user_id, role) 
VALUES ('641d58e3-3720-422e-aac7-b0acf0899601', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;