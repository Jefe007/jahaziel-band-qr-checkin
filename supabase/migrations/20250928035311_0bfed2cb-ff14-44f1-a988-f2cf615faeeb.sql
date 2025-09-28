-- Remove all existing policies for registrations table and recreate them properly
DROP POLICY IF EXISTS "Public can register for event" ON public.registrations;
DROP POLICY IF EXISTS "Only admins can read registrations" ON public.registrations;
DROP POLICY IF EXISTS "Admins can update registrations" ON public.registrations;
DROP POLICY IF EXISTS "Admins can delete registrations" ON public.registrations;

-- Create new policies that work correctly
-- Allow anyone to insert (register)
CREATE POLICY "Allow public registration" 
ON public.registrations 
FOR INSERT 
TO public
WITH CHECK (true);

-- Only admins can read registrations
CREATE POLICY "Admins only can read registrations" 
ON public.registrations 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Only admins can update registrations
CREATE POLICY "Admins only can update registrations" 
ON public.registrations 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Only admins can delete registrations
CREATE POLICY "Admins only can delete registrations" 
ON public.registrations 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'));