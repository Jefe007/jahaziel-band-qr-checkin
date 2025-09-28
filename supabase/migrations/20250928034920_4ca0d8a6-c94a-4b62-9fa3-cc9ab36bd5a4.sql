-- Fix RLS policy to allow public registration but restrict reading to admins
-- First drop the existing insert policy that might have been affected
DROP POLICY IF EXISTS "Anyone can insert registrations" ON public.registrations;

-- Create new insert policy that allows public registration
CREATE POLICY "Public can register for event" 
ON public.registrations 
FOR INSERT 
WITH CHECK (true);

-- Ensure the reading policy is correctly restricted to admins only
-- (This should already be in place from the previous migration)