import { supabase } from '@/integrations/supabase/client';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  text: string;
}

interface TelegramUpdate {
  update_id: number;
  message: TelegramMessage;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json() as TelegramUpdate;
    
    if (!message || !message.text) {
      return new Response('No message text', { status: 400, headers: corsHeaders });
    }

    const chatId = message.chat.id.toString();
    const text = message.text.trim();
    
    console.log(`Received message from chat ${chatId}: ${text}`);

    // Find user by telegram chat_id
    const { data: telegramConfig, error: configError } = await supabase
      .from('telegram_config')
      .select('user_id, ativo')
      .eq('telegram_chat_id', chatId)
      .eq('ativo', true)
      .single();

    if (configError || !telegramConfig) {
      console.log('User not found or bot inactive');
      return new Response('User not configured', { status: 400, headers: corsHeaders });
    }

    const userId = telegramConfig.user_id;

    // Get user's accounts and categories for transactions
    const [accountsRes, categoriesRes] = await Promise.all([
      supabase.from('contas').select('id, nome').eq('user_id', userId).limit(5),
      supabase.from('categorias').select('id, nome, tipo').eq('user_id', userId)
    ]);

    const accounts = accountsRes.data || [];
    const categories = categoriesRes.data || [];

    // Parse commands
    if (text.startsWith('/add')) {
      return await handleAddTransaction(text, userId, accounts, categories);
    } else if (text.startsWith('/saldo')) {
      return await handleBalance(userId, accounts);
    } else if (text.startsWith('/relatorio')) {
      return await handleReport(userId);
    } else if (text.startsWith('/help') || text.startsWith('/start')) {
      return await handleHelp();
    } else {
      // Try to parse as natural language
      return await handleNaturalLanguage(text, userId, accounts, categories);
    }

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Internal error', { status: 500, headers: corsHeaders });
  }
});

async function handleAddTransaction(
  text: string, 
  userId: string, 
  accounts: any[], 
  categories: any[]
) {
  // Parse: /add 120.50 supermercado alimentação
  const parts = text.split(' ').slice(1); // Remove /add
  
  if (parts.length < 2) {
    return new Response(JSON.stringify({
      text: 'Uso: /add [valor] [descrição] [categoria]\nExemplo: /add 50.00 almoço alimentação'
    }), { headers: corsHeaders });
  }

  const valor = parseFloat(parts[0]);
  if (isNaN(valor)) {
    return new Response(JSON.stringify({
      text: 'Valor inválido. Use formato: 50.00'
    }), { headers: corsHeaders });
  }

  const descricao = parts.slice(1, -1).join(' ') || parts.slice(1).join(' ');
  const categoriaName = parts[parts.length - 1];
  
  // Find category
  const categoria = categories.find(c => 
    c.nome.toLowerCase().includes(categoriaName.toLowerCase()) && c.tipo === 'despesa'
  );

  // Use first account as default
  const conta = accounts[0];
  
  if (!conta) {
    return new Response(JSON.stringify({
      text: 'Nenhuma conta encontrada. Adicione uma conta primeiro no app.'
    }), { headers: corsHeaders });
  }

  try {
    // Create transaction
    const { error } = await supabase
      .from('transacoes')
      .insert([{
        user_id: userId,
        tipo: 'despesa',
        valor: valor,
        descricao: descricao,
        conta_id: conta.id,
        categoria_id: categoria?.id || null,
        data_transacao: new Date().toISOString().split('T')[0],
        status: 'confirmado'
      }]);

    if (error) throw error;

    const response = categoria
      ? `✅ Despesa adicionada: R$ ${valor.toFixed(2)}\n📝 ${descricao}\n🏷️ ${categoria.nome}\n🏦 ${conta.nome}`
      : `✅ Despesa adicionada: R$ ${valor.toFixed(2)}\n📝 ${descricao}\n🏦 ${conta.nome}\n⚠️ Categoria não encontrada`;

    return new Response(JSON.stringify({ text: response }), { headers: corsHeaders });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return new Response(JSON.stringify({
      text: 'Erro ao salvar transação. Tente novamente.'
    }), { headers: corsHeaders });
  }
}

async function handleBalance(userId: string, accounts: any[]) {
  if (accounts.length === 0) {
    return new Response(JSON.stringify({
      text: '❌ Nenhuma conta encontrada.'
    }), { headers: corsHeaders });
  }

  let response = '💰 *Saldo das Contas:*\n\n';
  let total = 0;

  for (const account of accounts) {
    response += `🏦 ${account.nome}: R$ ${account.saldo_atual?.toFixed(2) || '0.00'}\n`;
    total += account.saldo_atual || 0;
  }

  response += `\n💎 *Total:* R$ ${total.toFixed(2)}`;

  return new Response(JSON.stringify({ text: response }), { headers: corsHeaders });
}

async function handleReport(userId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  
  const { data: transactions, error } = await supabase
    .from('transacoes')
    .select('tipo, valor, categorias(nome)')
    .eq('user_id', userId)
    .gte('data_transacao', startOfMonth.toISOString().split('T')[0]);

  if (error) {
    return new Response(JSON.stringify({
      text: 'Erro ao gerar relatório.'
    }), { headers: corsHeaders });
  }

  const receitas = transactions?.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + t.valor, 0) || 0;
  const despesas = transactions?.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + t.valor, 0) || 0;
  const saldo = receitas - despesas;

  let response = `📊 *Relatório do Mês*\n\n`;
  response += `💚 Receitas: R$ ${receitas.toFixed(2)}\n`;
  response += `❌ Despesas: R$ ${despesas.toFixed(2)}\n`;
  response += `${saldo >= 0 ? '✅' : '⚠️'} Saldo: R$ ${saldo.toFixed(2)}`;

  return new Response(JSON.stringify({ text: response }), { headers: corsHeaders });
}

async function handleHelp() {
  const helpText = `🤖 *Comandos Disponíveis:*

/add [valor] [descrição] [categoria]
📝 Adicionar despesa
Ex: /add 50.00 almoço alimentação

/saldo
💰 Ver saldo das contas

/relatorio
📊 Relatório mensal

/help
❓ Esta ajuda

Você também pode enviar mensagens como:
"Gastei 30 reais no supermercado"
"Comprei café por 5 reais"`;

  return new Response(JSON.stringify({ text: helpText }), { headers: corsHeaders });
}

async function handleNaturalLanguage(
  text: string, 
  userId: string, 
  accounts: any[], 
  categories: any[]
) {
  // Simple NLP for common patterns
  const lowerText = text.toLowerCase();
  
  // Look for monetary values
  const moneyRegex = /(\d+(?:[.,]\d{2})?)\s*(?:reais?|r\$|brl)?/i;
  const moneyMatch = text.match(moneyRegex);
  
  if (!moneyMatch) {
    return new Response(JSON.stringify({
      text: 'Não consegui identificar o valor. Use: /add [valor] [descrição]'
    }), { headers: corsHeaders });
  }

  const valor = parseFloat(moneyMatch[1].replace(',', '.'));
  
  // Extract description (remove the money part)
  let descricao = text.replace(moneyRegex, '').trim();
  descricao = descricao.replace(/^(gastei|comprei|paguei|despesa)\s*/i, '');
  descricao = descricao.replace(/\s*(no|na|em|por|com)\s*/i, ' ');
  descricao = descricao.trim();

  if (!descricao) {
    descricao = 'Despesa via Telegram';
  }

  // Try to find category by keywords
  const foodKeywords = ['supermercado', 'mercado', 'comida', 'almoço', 'jantar', 'café', 'lanche', 'restaurante'];
  const transportKeywords = ['uber', 'taxi', 'ônibus', 'gasolina', 'combustível', 'estacionamento'];
  
  let categoria = null;
  
  if (foodKeywords.some(keyword => lowerText.includes(keyword))) {
    categoria = categories.find(c => c.nome.toLowerCase().includes('alimentação') && c.tipo === 'despesa');
  } else if (transportKeywords.some(keyword => lowerText.includes(keyword))) {
    categoria = categories.find(c => c.nome.toLowerCase().includes('transporte') && c.tipo === 'despesa');
  }

  const conta = accounts[0];
  
  if (!conta) {
    return new Response(JSON.stringify({
      text: 'Nenhuma conta encontrada. Adicione uma conta primeiro no app.'
    }), { headers: corsHeaders });
  }

  try {
    const { error } = await supabase
      .from('transacoes')
      .insert([{
        user_id: userId,
        tipo: 'despesa',
        valor: valor,
        descricao: descricao,
        conta_id: conta.id,
        categoria_id: categoria?.id || null,
        data_transacao: new Date().toISOString().split('T')[0],
        status: 'confirmado'
      }]);

    if (error) throw error;

    const response = categoria
      ? `✅ Despesa registrada: R$ ${valor.toFixed(2)}\n📝 ${descricao}\n🏷️ ${categoria.nome}\n🏦 ${conta.nome}`
      : `✅ Despesa registrada: R$ ${valor.toFixed(2)}\n📝 ${descricao}\n🏦 ${conta.nome}`;

    return new Response(JSON.stringify({ text: response }), { headers: corsHeaders });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return new Response(JSON.stringify({
      text: 'Erro ao salvar transação. Tente novamente.'
    }), { headers: corsHeaders });
  }
}