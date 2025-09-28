-- Update RLS policies for event_settings to include super_admin
DROP POLICY IF EXISTS "Admins can insert event settings" ON public.event_settings;
DROP POLICY IF EXISTS "Admins can update event settings" ON public.event_settings;

CREATE POLICY "Admins and super_admins can insert event settings" 
ON public.event_settings 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins and super_admins can update event settings" 
ON public.event_settings 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Update RLS policies for registrations to support new roles
DROP POLICY IF EXISTS "admins_can_delete" ON public.registrations;
DROP POLICY IF EXISTS "admins_can_update" ON public.registrations;

-- Check-in operators can only update (simplified policy - validation will be handled in the app)
CREATE POLICY "checkin_operators_can_update" 
ON public.registrations 
FOR UPDATE 
USING ((auth.uid() IS NOT NULL) AND has_role(auth.uid(), 'checkin_operator'::app_role));

-- Registration managers can update and delete registrations
CREATE POLICY "registrations_managers_can_update" 
ON public.registrations 
FOR UPDATE 
USING ((auth.uid() IS NOT NULL) AND has_role(auth.uid(), 'registrations_manager'::app_role));

CREATE POLICY "registrations_managers_can_delete" 
ON public.registrations 
FOR DELETE 
USING ((auth.uid() IS NOT NULL) AND has_role(auth.uid(), 'registrations_manager'::app_role));

-- Admins and super_admins have full access
CREATE POLICY "admins_can_update" 
ON public.registrations 
FOR UPDATE 
USING ((auth.uid() IS NOT NULL) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)));

CREATE POLICY "admins_can_delete" 
ON public.registrations 
FOR DELETE 
USING ((auth.uid() IS NOT NULL) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)));

-- Update user_roles policies to allow super_admins to manage users
DROP POLICY IF EXISTS "Only admins can delete user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can read user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update user roles" ON public.user_roles;

CREATE POLICY "Admins and super_admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins and super_admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins and super_admins can read user roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins and super_admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));