---
name: uazapi-whatsapp-integration
description: Integra WhatsApp via Uazapi GO v2 usando instâncias, QR, status e envio de mensagens.
---

# Uazapi GO v2 (WhatsApp)

## Instruções

1. Entenda os conceitos
   - Instância: sessão WhatsApp vinculada a um número.
   - Instance token: token específico por instância (sensível).
   - QR code / Pairing code: pareamento da instância.
   - JID: identificador WhatsApp (ex: `5511999999999@s.whatsapp.net`).

2. Configure autenticação com segurança
   - A autenticação usa o header `token` (lowercase).
   - Nunca coloque token real em código versionado.
   - Configure por variáveis de ambiente.

3. Implemente os endpoints essenciais
   - Conectar (gerar QR): `POST /instance/connect`
   - Status: `GET /instance/status`
   - Desconectar (v2): `POST /instance/disconnect` (não use `/instance/logout` na v2)
   - Mensagens:
     - Texto: `POST /message/text/{instanceName}`
     - Mídia: `POST /message/media/{instanceName}`

4. Faça mapeamento de status para UI
   - `connected`: operacional
   - `connecting`: aguardando pareamento
   - `disconnected`: sem sessão
   - `qrcode`: QR disponível

5. Extraia telefone com prioridade segura
   - Prioridade: `instance.owner` > `status.jid` > `instance.jid` > `data.jid`.
   - Normalize removendo `:xx` e `@...` quando necessário.

6. Trate erros e debug
   - 401: token inválido/ausente
   - 404: endpoint incorreto/URL errada
   - 500: erro interno (retry/backoff)
   - Use DevTools Network para validar payload real.

## Exemplos

### Exemplo 1: Variáveis de ambiente (template)

```env
VITE_UAZAPI_URL=https://seu-subdominio.uazapi.com
VITE_UAZAPI_INSTANCE_TOKEN=seu_instance_token_aqui
```

### Exemplo 2: Headers obrigatórios

```http
Content-Type: application/json
token: {INSTANCE_TOKEN}
```

### Exemplo 3: Conectar instância (QR)

```http
POST /instance/connect
```

Campos úteis na resposta:
- `instance.qrcode`
- `instance.paircode`

### Exemplo 4: Verificar status e extrair telefone

```typescript
const phone =
  instance.owner ||
  (typeof data.status === "object" && data.status?.jid?.split("@")[0]?.split(":")[0]) ||
  instance.jid?.split("@")[0]?.split(":")[0] ||
  data.jid?.split("@")[0]?.split(":")[0];
```

### Exemplo 5: Desconectar (v2)

```http
POST /instance/disconnect
```

### Exemplo 6: Enviar mensagem de texto

```http
POST /message/text/{instanceName}
```

```json
{
  "number": "5511999999999",
  "message": "Olá, sua consulta está confirmada para amanhã às 14h."
}
```

### Exemplo 7: Referências

- https://docs.uazapi.com
- https://docs.uazapi.com/endpoint/post/instance~connect
- https://docs.uazapi.com/endpoint/get/instance~status
