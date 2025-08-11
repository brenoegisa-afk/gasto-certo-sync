import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { from_conta, to_conta, valor, descricao } = await req.json();

    if (!from_conta || !to_conta || !valor || valor <= 0) {
      return new Response(
        JSON.stringify({ error: 'Parâmetros inválidos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (from_conta === to_conta) {
      return new Response(
        JSON.stringify({ error: 'Conta de origem e destino devem ser diferentes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token de autorização necessário' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user owns both accounts
    const { data: accounts, error: accountsError } = await supabaseClient
      .from('contas')
      .select('*')
      .in('id', [from_conta, to_conta])
      .eq('user_id', user.id);

    if (accountsError || accounts.length !== 2) {
      return new Response(
        JSON.stringify({ error: 'Contas não encontradas ou não pertencem ao usuário' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fromAccount = accounts.find(acc => acc.id === from_conta);
    const toAccount = accounts.find(acc => acc.id === to_conta);

    // Check if from account has sufficient balance
    if (parseFloat(fromAccount.saldo_atual) < parseFloat(valor)) {
      return new Response(
        JSON.stringify({ error: 'Saldo insuficiente na conta de origem' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Start transaction
    const { data, error } = await supabaseClient.rpc('execute_transfer', {
      p_user_id: user.id,
      p_from_conta: from_conta,
      p_to_conta: to_conta,
      p_valor: parseFloat(valor),
      p_descricao: descricao || 'Transferência interna'
    });

    if (error) {
      console.error('Transfer error:', error);
      return new Response(
        JSON.stringify({ error: 'Erro ao executar transferência' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Transferência realizada com sucesso',
        transfer_id: data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});