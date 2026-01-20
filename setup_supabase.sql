-- RUN THIS IN YOUR SUPABASE SQL EDITOR --

-- 1. Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  permissions JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies (Idempotent: Drop first IF exists)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Allow authenticated users to read profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- 4. Create a trigger to automatically create profiles
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, permissions)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'System User'), 
    'user',
    '{"map": true, "surveys": true, "financials": false, "performance": true, "tickets": true, "stats": false, "settings": true, "style_lab": false}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. MANUALLY CONFIRM EXISTING USERS
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 6. SYNC PROFILE ROLES FOR TEST ACCOUNTS
-- Ensure the Admin account has the correct role and permissions
INSERT INTO public.profiles (id, full_name, role, permissions)
SELECT id, 'System Administrator', 'admin', '{"map": true, "surveys": true, "financials": true, "performance": true, "tickets": true, "stats": true, "settings": true, "style_lab": true}'::jsonb
FROM auth.users 
WHERE email = 'billing.admin@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', 
    permissions = '{"map": true, "surveys": true, "financials": true, "performance": true, "tickets": true, "stats": true, "settings": true, "style_lab": true}'::jsonb;

-- Ensure the standard User account has the correct role
INSERT INTO public.profiles (id, full_name, role, permissions)
SELECT id, 'Field Operator', 'user', '{"map": true, "surveys": true, "financials": false, "performance": true, "tickets": true, "stats": false, "settings": true, "style_lab": false}'::jsonb
FROM auth.users 
WHERE email = 'billing.user@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'user';
