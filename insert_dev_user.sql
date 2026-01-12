-- Insert the Dev User into auth.users (Requires Service Role or Dashboard execution)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'developer@agentpro.kit',
  '$2a$10$wK/p.8f.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0', -- Dummy hash
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Insert the Dev User into public.profiles
INSERT INTO public.profiles (id, email, display_name, role)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'developer@agentpro.kit',
  'Dev Admin',
  'admin'
) ON CONFLICT (id) DO NOTHING;

-- Verification
SELECT * FROM public.profiles WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
