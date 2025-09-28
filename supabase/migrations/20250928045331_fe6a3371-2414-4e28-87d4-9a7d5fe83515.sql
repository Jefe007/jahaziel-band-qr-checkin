-- First, add the new enum values
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'checkin_operator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'registrations_manager';