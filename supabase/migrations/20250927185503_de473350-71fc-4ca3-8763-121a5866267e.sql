-- Create the registrations table for JAHAZIEL BAND concert
CREATE TABLE public.registrations (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    telefono TEXT UNIQUE NOT NULL,
    direccion TEXT NOT NULL,
    iglesia TEXT,
    pastor TEXT,
    confirmado BOOLEAN DEFAULT false,
    ticket_url TEXT,
    checked_in BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for public registration (anyone can insert)
CREATE POLICY "Anyone can insert registrations" 
ON public.registrations 
FOR INSERT 
WITH CHECK (true);

-- Create policies for public read (anyone can read their own registration by phone)
CREATE POLICY "Anyone can read registrations" 
ON public.registrations 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_registrations_updated_at
BEFORE UPDATE ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create a settings table for managing registration status
CREATE TABLE public.event_settings (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for settings
ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to settings
CREATE POLICY "Anyone can read event settings" 
ON public.event_settings 
FOR SELECT 
USING (true);

-- Insert initial settings
INSERT INTO public.event_settings (key, value) VALUES 
('registration_enabled', 'true'),
('max_capacity', '1500');

-- Create trigger for settings timestamps
CREATE TRIGGER update_event_settings_updated_at
BEFORE UPDATE ON public.event_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create user roles for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Admin policies for managing registrations
CREATE POLICY "Admins can update registrations" 
ON public.registrations 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete registrations" 
ON public.registrations 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for managing settings
CREATE POLICY "Admins can update event settings" 
ON public.event_settings 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert event settings" 
ON public.event_settings 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));