-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE account_type AS ENUM ('corrente', 'poupanca', 'carteira', 'externa');
CREATE TYPE transaction_type AS ENUM ('despesa', 'receita', 'transferencia');
CREATE TYPE transaction_status AS ENUM ('pendente', 'confirmado');
CREATE TYPE category_type AS ENUM ('despesa', 'receita');
CREATE TYPE card_status AS ENUM ('ativo', 'inativo');
CREATE TYPE user_role AS ENUM ('owner', 'editor', 'viewer');

-- Create contas table
CREATE TABLE public.contas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    nome TEXT NOT NULL,
    tipo account_type NOT NULL DEFAULT 'corrente',
    saldo_inicial NUMERIC(15,2) NOT NULL DEFAULT 0,
    saldo_atual NUMERIC(15,2) NOT NULL DEFAULT 0,
    moeda TEXT NOT NULL DEFAULT 'BRL',
    limite NUMERIC(15,2) NULL,
    compartilhada BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create contas_partilhadas table for multi-user support
CREATE TABLE public.contas_partilhadas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conta_id UUID NOT NULL REFERENCES public.contas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create cartoes table
CREATE TABLE public.cartoes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    nome TEXT NOT NULL,
    bandeira TEXT NOT NULL,
    limite NUMERIC(15,2) NOT NULL,
    dia_fechamento INTEGER NOT NULL CHECK (dia_fechamento >= 1 AND dia_fechamento <= 31),
    dia_vencimento INTEGER NOT NULL CHECK (dia_vencimento >= 1 AND dia_vencimento <= 31),
    fechamento_offset INTEGER DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create categorias table
CREATE TABLE public.categorias (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    nome TEXT NOT NULL,
    tipo category_type NOT NULL,
    icone TEXT DEFAULT '💰',
    cor TEXT DEFAULT '#10B981',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create transacoes table
CREATE TABLE public.transacoes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    tipo transaction_type NOT NULL,
    valor NUMERIC(15,2) NOT NULL,
    descricao TEXT NOT NULL,
    categoria_id UUID NULL REFERENCES public.categorias(id),
    conta_id UUID NULL REFERENCES public.contas(id),
    conta_destino_id UUID NULL REFERENCES public.contas(id),
    cartao_id UUID NULL REFERENCES public.cartoes(id),
    parcelas_total INTEGER NULL,
    parcela_num INTEGER NULL,
    referencia_parcela_id UUID NULL,
    data_transacao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_registro TIMESTAMPTZ NOT NULL DEFAULT now(),
    status transaction_status NOT NULL DEFAULT 'confirmado',
    metadata JSONB NULL
);

-- Create faturas_cartao table
CREATE TABLE public.faturas_cartao (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    cartao_id UUID NOT NULL REFERENCES public.cartoes(id) ON DELETE CASCADE,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    valor_total NUMERIC(15,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'aberta',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create transfers audit table
CREATE TABLE public.transfers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    from_conta UUID NOT NULL REFERENCES public.contas(id),
    to_conta UUID NOT NULL REFERENCES public.contas(id),
    valor NUMERIC(15,2) NOT NULL,
    data TIMESTAMPTZ NOT NULL DEFAULT now(),
    transacao_saida_id UUID NOT NULL REFERENCES public.transacoes(id),
    transacao_entrada_id UUID NOT NULL REFERENCES public.transacoes(id)
);

-- Create profiles table for additional user info
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    nome TEXT,
    telegram_id TEXT NULL,
    telegram_username TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_partilhadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cartoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faturas_cartao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contas
CREATE POLICY "Users can view their own contas" 
ON public.contas FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contas" 
ON public.contas FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contas" 
ON public.contas FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contas" 
ON public.contas FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for cartoes
CREATE POLICY "Users can view their own cartoes" 
ON public.cartoes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cartoes" 
ON public.cartoes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cartoes" 
ON public.cartoes FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cartoes" 
ON public.cartoes FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for categorias
CREATE POLICY "Users can view their own categorias" 
ON public.categorias FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categorias" 
ON public.categorias FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categorias" 
ON public.categorias FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categorias" 
ON public.categorias FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for transacoes
CREATE POLICY "Users can view their own transacoes" 
ON public.transacoes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transacoes" 
ON public.transacoes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transacoes" 
ON public.transacoes FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transacoes" 
ON public.transacoes FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for faturas_cartao
CREATE POLICY "Users can view faturas of their own cartoes" 
ON public.faturas_cartao FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.cartoes WHERE cartoes.id = faturas_cartao.cartao_id AND cartoes.user_id = auth.uid()));

CREATE POLICY "Users can create faturas for their own cartoes" 
ON public.faturas_cartao FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.cartoes WHERE cartoes.id = faturas_cartao.cartao_id AND cartoes.user_id = auth.uid()));

CREATE POLICY "Users can update faturas of their own cartoes" 
ON public.faturas_cartao FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.cartoes WHERE cartoes.id = faturas_cartao.cartao_id AND cartoes.user_id = auth.uid()));

-- Create RLS policies for transfers
CREATE POLICY "Users can view their own transfers" 
ON public.transfers FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transfers" 
ON public.transfers FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for contas_partilhadas
CREATE POLICY "Users can view shared contas they have access to" 
ON public.contas_partilhadas FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Owners can manage shared conta access" 
ON public.contas_partilhadas FOR ALL 
USING (EXISTS (SELECT 1 FROM public.contas WHERE contas.id = contas_partilhadas.conta_id AND contas.user_id = auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_contas_updated_at
    BEFORE UPDATE ON public.contas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cartoes_updated_at
    BEFORE UPDATE ON public.cartoes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, nome)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'nome');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_contas_user_id ON public.contas(user_id);
CREATE INDEX idx_cartoes_user_id ON public.cartoes(user_id);
CREATE INDEX idx_categorias_user_id ON public.categorias(user_id);
CREATE INDEX idx_transacoes_user_id ON public.transacoes(user_id);
CREATE INDEX idx_transacoes_data ON public.transacoes(data_transacao);
CREATE INDEX idx_transacoes_conta_id ON public.transacoes(conta_id);
CREATE INDEX idx_transacoes_cartao_id ON public.transacoes(cartao_id);
CREATE INDEX idx_faturas_cartao_id ON public.faturas_cartao(cartao_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);

-- Insert default categories
INSERT INTO public.categorias (user_id, nome, tipo, icone, cor) VALUES
-- Using a placeholder UUID that will be replaced by actual user IDs in the seed function
('00000000-0000-0000-0000-000000000000', 'Alimentação', 'despesa', '🍽️', '#EF4444'),
('00000000-0000-0000-0000-000000000000', 'Transporte', 'despesa', '🚗', '#F59E0B'),
('00000000-0000-0000-0000-000000000000', 'Lazer', 'despesa', '🎮', '#8B5CF6'),
('00000000-0000-0000-0000-000000000000', 'Saúde', 'despesa', '🏥', '#EC4899'),
('00000000-0000-0000-0000-000000000000', 'Casa', 'despesa', '🏠', '#06B6D4'),
('00000000-0000-0000-0000-000000000000', 'Salário', 'receita', '💰', '#10B981'),
('00000000-0000-0000-0000-000000000000', 'Freelance', 'receita', '💻', '#3B82F6'),
('00000000-0000-0000-0000-000000000000', 'Investimentos', 'receita', '📈', '#059669');

-- Create function to create default categories for new users
CREATE OR REPLACE FUNCTION public.create_default_categories(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Delete placeholder categories if they exist
    DELETE FROM public.categorias WHERE user_id = '00000000-0000-0000-0000-000000000000';
    
    -- Insert default categories for the specific user
    INSERT INTO public.categorias (user_id, nome, tipo, icone, cor) VALUES
    (target_user_id, 'Alimentação', 'despesa', '🍽️', '#EF4444'),
    (target_user_id, 'Transporte', 'despesa', '🚗', '#F59E0B'),
    (target_user_id, 'Lazer', 'despesa', '🎮', '#8B5CF6'),
    (target_user_id, 'Saúde', 'despesa', '🏥', '#EC4899'),
    (target_user_id, 'Casa', 'despesa', '🏠', '#06B6D4'),
    (target_user_id, 'Salário', 'receita', '💰', '#10B981'),
    (target_user_id, 'Freelance', 'receita', '💻', '#3B82F6'),
    (target_user_id, 'Investimentos', 'receita', '📈', '#059669');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;