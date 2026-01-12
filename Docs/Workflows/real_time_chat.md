---
name: realtime-chat-supabase
description: Implementa, debuga e mantém chat realtime com Supabase e React Context.
---

# Realtime Chat (Supabase)

## Instruções

1. Verifique a base de dados (backend)
   - Valide o schema no Supabase antes de alterar código.
   - Garanta que a tabela `messages` existe com as colunas: `id` (uuid), `content` (text), `channel_id` (uuid), `author_id` (uuid), `created_at` (timestamp).

2. Valide políticas de segurança (RLS)
   - INSERT: permitir apenas se `auth.uid() == author_id` e o usuário for membro do canal.
   - SELECT: permitir se canal público (`is_private = false`) ou o usuário for membro.
   - Se houver erro de permissão, ajuste a policy, não desabilite o RLS.

3. Trate triggers e webhooks (edge cases)
   - Verifique a function `fn_notify_message_new`.
   - Garanta que o SQL trata falhas de configuração.
   - Use `current_setting('app.notify_function_url', true)` para checar se a URL do webhook existe antes de tentar um POST.
   - Evite que falhas na Edge Function bloqueiem o `INSERT` da mensagem.

4. Gerencie estado via Context API
   - Ao manipular `src/context/CommunityContext.tsx`, mantenha uma assinatura única (singleton).
   - Não crie listeners por canal; assine uma vez e filtre eventos da tabela `messages`.
   - Foque no evento `INSERT`.

5. Reconcilie a mensagem recebida (on payload)
   - Ao receber `payload.new`, trate como `msg`.
   - Se `msg.channel_id === activeChannelId`, faça append no estado local imediatamente e force scroll.
   - Se for outro canal, incremente `unreadCounts` do canal específico.
   - Avalie `@mentions` e canais `dm-*` para contadores globais.

6. Cuide da UI e performance
   - Evite re-renderizações em cascata.
   - Garanta que `Sidebar` e `ChatArea` consumam seletores diferentes ou estejam memoizados.
   - Digitar no input do chat não deve re-renderizar a lista de canais da Sidebar.
   - O feedback visual pode vir do Realtime, mas o tratamento de erro do envio precisa ser robusto.

7. Faça tratamento de erro no envio
   - No método `sendMessage` (ou equivalente), envolva `supabase.insert` em `try/catch`.
   - Em caso de erro (RLS, rede), exiba feedback visual e não limpe o input.
   - Se for logar, sanitize e evite expor conteúdo sensível.

8. Execute checklist de validação
   - Enviar mensagem aparece instantaneamente para o próprio usuário.
   - Enviar mensagem aparece em outra aba/janela (simulando outro usuário).
   - Mensagem em canal inativo incrementa contador não lido.
   - Erro de rede ou RLS exibe feedback visual sem quebrar a aplicação.
   - Scroll rola para o final ao receber nova mensagem no canal ativo.

## Exemplos

### Exemplo 1: Implementar schema e RLS antes do frontend

- Criar/verificar tabela `messages` com colunas mínimas.
- Criar policies de SELECT e INSERT com validação de membro do canal.
- Validar que um usuário não-membro não consegue ler nem inserir mensagens (teste negativo).

### Exemplo 2: Ajustar assinatura realtime única

- Criar uma única assinatura de Realtime para `messages` em `src/context/CommunityContext.tsx`.
- No handler do evento `INSERT`, fazer:
  - Append se for canal ativo.
  - Incremento de não lidos se estiver em background.

### Exemplo 3: Tratar erro de envio sem perder mensagem

- Envolver `supabase.insert` em `try/catch`.
- Em caso de falha, manter o conteúdo no input e exibir alerta visual.
