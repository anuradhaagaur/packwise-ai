-- ==============================================================================
-- PACKWISE AI — Database Schema & RLS Policies
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    company TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Commodities Table (Reference food database)
CREATE TABLE IF NOT EXISTS public.commodities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    fresh_produce BOOLEAN DEFAULT false NOT NULL,
    default_moisture NUMERIC(5,2) DEFAULT 50.0,
    default_oil NUMERIC(5,2) DEFAULT 2.0,
    default_ph NUMERIC(4,2) DEFAULT 6.0,
    default_respiration TEXT DEFAULT 'Very Low',
    moisture_sensitivity TEXT DEFAULT 'Moderate',
    perishability TEXT DEFAULT 'Moderate',
    typical_storage TEXT DEFAULT 'Ambient',
    typical_shelf_life_days INT DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Materials Table (Packaging material catalog with barrier parameters)
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    oxygen_barrier INT NOT NULL CHECK (oxygen_barrier BETWEEN 1 AND 5),
    moisture_barrier INT NOT NULL CHECK (moisture_barrier BETWEEN 1 AND 5),
    light_barrier INT NOT NULL CHECK (light_barrier BETWEEN 1 AND 5),
    sealability INT NOT NULL CHECK (sealability BETWEEN 1 AND 5),
    mechanical_strength INT NOT NULL CHECK (mechanical_strength BETWEEN 1 AND 5),
    relative_cost INT NOT NULL CHECK (relative_cost BETWEEN 1 AND 5),
    recyclability TEXT NOT NULL CHECK (recyclability IN ('High', 'Moderate', 'Low', 'Compostable', 'Specialized')),
    sustainability INT NOT NULL CHECK (sustainability BETWEEN 1 AND 5),
    otr_value NUMERIC(10,2) NOT NULL, -- cc/m2.day
    otr_label TEXT NOT NULL,
    wvtr_value NUMERIC(10,2) NOT NULL, -- g/m2.day
    wvtr_label TEXT NOT NULL,
    thickness_range TEXT NOT NULL,
    temp_min NUMERIC(5,1) NOT NULL, -- °C
    temp_max NUMERIC(5,1) NOT NULL, -- °C
    map_suitable BOOLEAN DEFAULT true NOT NULL,
    fresh_produce_suitable BOOLEAN DEFAULT false NOT NULL,
    typical_applications TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Analyses Table (User packaging analysis sessions)
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    commodity_name TEXT NOT NULL,
    commodity_category TEXT NOT NULL,
    storage_type TEXT NOT NULL,
    inputs JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Recommendations Table (Generated best match recommendation)
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    material_slug TEXT NOT NULL,
    material_name TEXT NOT NULL,
    compatibility INT NOT NULL,
    shelf_life_min INT NOT NULL,
    shelf_life_max INT NOT NULL,
    reasons JSONB DEFAULT '[]'::jsonb NOT NULL,
    specifications JSONB DEFAULT '{}'::jsonb NOT NULL,
    factors JSONB DEFAULT '[]'::jsonb NOT NULL,
    map_conditions JSONB DEFAULT '{}'::jsonb,
    alternatives JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Analysis Material Scores Table (Ranked scores for all materials for each analysis)
CREATE TABLE IF NOT EXISTS public.analysis_material_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    material_slug TEXT NOT NULL,
    material_name TEXT NOT NULL,
    score INT NOT NULL,
    breakdown JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Reports Table (Saved generated reports)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
    report_title TEXT NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Analysis Shares Table (Public or shareable links)
CREATE TABLE IF NOT EXISTS public.analysis_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
    share_token TEXT UNIQUE NOT NULL,
    is_public BOOLEAN DEFAULT true NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commodities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_material_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_shares ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can read all basic profiles, update their own
CREATE POLICY "Public profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Commodities: Everyone (including public) can view commodities, only admins can modify
CREATE POLICY "Commodities are viewable by all"
    ON public.commodities FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert commodities"
    ON public.commodities FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update commodities"
    ON public.commodities FOR UPDATE
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins can delete commodities"
    ON public.commodities FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- Materials: Everyone can view materials, only admins can modify
CREATE POLICY "Materials are viewable by all"
    ON public.materials FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert materials"
    ON public.materials FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update materials"
    ON public.materials FOR UPDATE
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins can delete materials"
    ON public.materials FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- Analyses: Users can only view, insert, update, and delete their own analyses (Admins can view all)
CREATE POLICY "Users can view own analyses"
    ON public.analyses FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own analyses"
    ON public.analyses FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses"
    ON public.analyses FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
    ON public.analyses FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Recommendations: Owned by user
CREATE POLICY "Users can view recommendations"
    ON public.recommendations FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert recommendations"
    ON public.recommendations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Material Scores: Owned by user
CREATE POLICY "Users can view material scores"
    ON public.analysis_material_scores FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert material scores"
    ON public.analysis_material_scores FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Reports: Owned by user
CREATE POLICY "Users can view own reports"
    ON public.reports FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert reports"
    ON public.reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
    ON public.reports FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Analysis Shares: Publicly viewable if token matches
CREATE POLICY "Shared analyses are viewable by anyone with token"
    ON public.analysis_shares FOR SELECT
    USING (is_public = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Users can create shares for own analyses"
    ON public.analysis_shares FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.analyses
            WHERE id = analysis_shares.analysis_id AND user_id = auth.uid()
        )
    );

-- Trigger for creating profile on new auth user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'role', 'user')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
