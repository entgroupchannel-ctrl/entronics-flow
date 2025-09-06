-- เพิ่มฟิลด์สำหรับ customer linking
ALTER TABLE public.customers 
ADD COLUMN linked_user_id UUID REFERENCES auth.users(id),
ADD COLUMN link_status TEXT DEFAULT 'unlinked',
ADD COLUMN verification_token TEXT;

-- สร้าง profiles table สำหรับข้อมูลผู้ใช้เพิ่มเติม
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  username TEXT,
  company_id UUID REFERENCES public.customers(id),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS สำหรับ profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- สร้าง policies สำหรับ profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- สร้าง index สำหรับ performance
CREATE INDEX IF NOT EXISTS idx_customers_linked_user_id ON public.customers(linked_user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);

-- สร้าง function สำหรับ handle การสร้าง profile อัตโนมัติ
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- สร้าง trigger สำหรับ auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();