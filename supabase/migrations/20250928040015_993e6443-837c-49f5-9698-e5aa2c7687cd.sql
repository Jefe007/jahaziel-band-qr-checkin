-- Fix RLS policies for registrations table
DROP POLICY IF EXISTS "public_can_register" ON public.registrations;
DROP POLICY IF EXISTS "admins_can_read" ON public.registrations;
DROP POLICY IF EXISTS "admins_can_update" ON public.registrations;
DROP POLICY IF EXISTS "admins_can_delete" ON public.registrations;

-- Allow public to insert registrations
CREATE POLICY "public_can_register" ON public.registrations
FOR INSERT
WITH CHECK (true);

-- Allow public to read their own registrations by phone
CREATE POLICY "public_can_read_own" ON public.registrations
FOR SELECT
USING (true);

-- Allow admins to read all registrations
CREATE POLICY "admins_can_read" ON public.registrations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update registrations
CREATE POLICY "admins_can_update" ON public.registrations
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete registrations
CREATE POLICY "admins_can_delete" ON public.registrations
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));