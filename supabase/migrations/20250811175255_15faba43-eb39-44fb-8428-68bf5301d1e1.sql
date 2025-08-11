-- Create telegram_config table for per-user bot configuration
CREATE TABLE public.telegram_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  telegram_token TEXT NOT NULL,
  telegram_chat_id TEXT,
  webhook_url TEXT,
  bot_username TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.telegram_config ENABLE ROW LEVEL SECURITY;

-- Create policies for telegram_config
CREATE POLICY "Users can view their own telegram config" 
ON public.telegram_config 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own telegram config" 
ON public.telegram_config 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own telegram config" 
ON public.telegram_config 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own telegram config" 
ON public.telegram_config 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_telegram_config_updated_at
BEFORE UPDATE ON public.telegram_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();