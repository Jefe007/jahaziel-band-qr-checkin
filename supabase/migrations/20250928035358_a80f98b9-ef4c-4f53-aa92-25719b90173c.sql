-- First get all policy names for registrations table
DO $$
DECLARE
    pol_name text;
BEGIN
    -- Drop all policies for registrations table
    FOR pol_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'registrations' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.registrations', pol_name);
    END LOOP;
END $$;

-- Now create the correct policies
-- Allow anyone (including anonymous users) to insert registrations
CREATE POLICY "public_can_register" 
ON public.registrations 
FOR INSERT 
WITH CHECK (true);

-- Only admins can select registrations
CREATE POLICY "admins_can_read" 
ON public.registrations 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Only admins can update registrations
CREATE POLICY "admins_can_update" 
ON public.registrations 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

-- Only admins can delete registrations
CREATE POLICY "admins_can_delete" 
ON public.registrations 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));