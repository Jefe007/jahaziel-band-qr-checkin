-- Fix critical security issue: Remove public read access to registrations table
-- This contains sensitive PII (names, phone numbers, addresses) that should only be accessible to admins

-- Drop the existing public read policy
DROP POLICY IF EXISTS "Anyone can read registrations" ON public.registrations;

-- Create new policy that only allows admins to read registrations
CREATE POLICY "Only admins can read registrations" 
ON public.registrations 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Also add missing RLS policies for user_roles table to fix the second security issue
CREATE POLICY "Only admins can read user roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));