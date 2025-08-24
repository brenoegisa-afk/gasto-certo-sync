-- Create user roles enum if not exists
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table if not exists
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Drop existing policies if they exist and create new ones with admin access
DROP POLICY IF EXISTS "Users can view their own contas" ON public.contas;
DROP POLICY IF EXISTS "Users can create their own contas" ON public.contas;
DROP POLICY IF EXISTS "Users can update their own contas" ON public.contas;

CREATE POLICY "Users can view their own contas or admins can view all"
ON public.contas FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own contas or admins can create any"
ON public.contas FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own contas or admins can update any"
ON public.contas FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Update cartoes policies
DROP POLICY IF EXISTS "Users can view their own cartoes" ON public.cartoes;
DROP POLICY IF EXISTS "Users can create their own cartoes" ON public.cartoes;
DROP POLICY IF EXISTS "Users can update their own cartoes" ON public.cartoes;

CREATE POLICY "Users can view their own cartoes or admins can view all"
ON public.cartoes FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own cartoes or admins can create any"
ON public.cartoes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own cartoes or admins can update any"
ON public.cartoes FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Update transacoes policies
DROP POLICY IF EXISTS "Users can view their own transacoes" ON public.transacoes;
DROP POLICY IF EXISTS "Users can create their own transacoes" ON public.transacoes;
DROP POLICY IF EXISTS "Users can update their own transacoes" ON public.transacoes;

CREATE POLICY "Users can view their own transacoes or admins can view all"
ON public.transacoes FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own transacoes or admins can create any"
ON public.transacoes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own transacoes or admins can update any"
ON public.transacoes FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Create policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));