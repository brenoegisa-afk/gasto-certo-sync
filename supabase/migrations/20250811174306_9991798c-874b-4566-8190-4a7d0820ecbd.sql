-- Create function for atomic transfers
CREATE OR REPLACE FUNCTION public.execute_transfer(
    p_user_id UUID,
    p_from_conta UUID,
    p_to_conta UUID,
    p_valor NUMERIC,
    p_descricao TEXT
)
RETURNS UUID AS $$
DECLARE
    transfer_id UUID;
    saida_id UUID;
    entrada_id UUID;
BEGIN
    -- Generate transfer ID
    transfer_id := gen_random_uuid();
    
    -- Create outgoing transaction
    INSERT INTO public.transacoes (
        user_id, tipo, valor, descricao, conta_id, data_transacao
    ) VALUES (
        p_user_id, 'transferencia', p_valor, p_descricao || ' (saída)', p_from_conta, CURRENT_DATE
    ) RETURNING id INTO saida_id;
    
    -- Create incoming transaction
    INSERT INTO public.transacoes (
        user_id, tipo, valor, descricao, conta_destino_id, data_transacao
    ) VALUES (
        p_user_id, 'transferencia', p_valor, p_descricao || ' (entrada)', p_to_conta, CURRENT_DATE
    ) RETURNING id INTO entrada_id;
    
    -- Update account balances
    UPDATE public.contas 
    SET saldo_atual = saldo_atual - p_valor 
    WHERE id = p_from_conta AND user_id = p_user_id;
    
    UPDATE public.contas 
    SET saldo_atual = saldo_atual + p_valor 
    WHERE id = p_to_conta AND user_id = p_user_id;
    
    -- Record transfer audit
    INSERT INTO public.transfers (
        id, user_id, from_conta, to_conta, valor, transacao_saida_id, transacao_entrada_id
    ) VALUES (
        transfer_id, p_user_id, p_from_conta, p_to_conta, p_valor, saida_id, entrada_id
    );
    
    RETURN transfer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;