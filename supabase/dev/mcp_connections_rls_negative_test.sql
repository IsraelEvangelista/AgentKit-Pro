BEGIN;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mcp_user1@agentpro.kit', '$2a$10$wK/p.8f.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mcp_user2@agentpro.kit', '$2a$10$wK/p.8f.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'mcp_user1@agentpro.kit', 'MCP User 1', 'operator'),
  ('22222222-2222-2222-2222-222222222222', 'mcp_user2@agentpro.kit', 'MCP User 2', 'operator')
ON CONFLICT (id) DO NOTHING;

SET LOCAL ROLE authenticated;

SELECT set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);

INSERT INTO public.mcp_connections (user_id, name, token_hash, token_prefix, allowed_skill_ids)
VALUES ('11111111-1111-1111-1111-111111111111', 'default', 'test_hash_user1', 'akp_test_user', '{}')
ON CONFLICT (token_hash) DO NOTHING;

DO $$
DECLARE
  visible_count INT;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  SELECT COUNT(*) INTO visible_count
  FROM public.mcp_connections
  WHERE user_id = '11111111-1111-1111-1111-111111111111';

  IF visible_count <> 0 THEN
    RAISE EXCEPTION 'RLS failed: user2 can read user1 mcp_connections';
  END IF;
END $$;

ROLLBACK;

