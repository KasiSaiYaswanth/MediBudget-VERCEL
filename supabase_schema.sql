-- MediBudget Initial Supabase Schema
-- Run this in the Supabase SQL editor

CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role)
);

CREATE TABLE public.hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    pricing_tier TEXT DEFAULT 'standard',
    consultation_cost NUMERIC,
    latitude NUMERIC,
    longitude NUMERIC,
    contact_phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    generic_name TEXT NOT NULL,
    category TEXT NOT NULL,
    dosage TEXT NOT NULL,
    price_range TEXT NOT NULL,
    prescription_required BOOLEAN NOT NULL DEFAULT false,
    uses TEXT[] NOT NULL DEFAULT '{}',
    side_effects TEXT[] NOT NULL DEFAULT '{}',
    warnings TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.government_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    state TEXT,
    coverage_amount NUMERIC NOT NULL,
    eligibility_criteria JSONB NOT NULL DEFAULT '{}',
    description TEXT
);

CREATE TABLE public.insurance_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    max_coverage NUMERIC NOT NULL,
    claim_ratio NUMERIC,
    partner_hospitals_count INT
);

CREATE TABLE public.symptom_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    symptoms TEXT[] NOT NULL,
    predicted_conditions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.cost_estimation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    city TEXT,
    condition TEXT,
    hospital_tier TEXT,
    estimated_cost NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security Definer Function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

-- Setup initial RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_estimation_logs ENABLE ROW LEVEL SECURITY;

-- Select policies
CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public read hospitals" ON public.hospitals FOR SELECT USING (true);
CREATE POLICY "Public read medicines" ON public.medicines FOR SELECT USING (true);
CREATE POLICY "Public read schemes" ON public.government_schemes FOR SELECT USING (true);
CREATE POLICY "Public read providers" ON public.insurance_providers FOR SELECT USING (true);

CREATE POLICY "Admins can insert hospitals" ON public.hospitals FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update hospitals" ON public.hospitals FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete hospitals" ON public.hospitals FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to auto-create user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

