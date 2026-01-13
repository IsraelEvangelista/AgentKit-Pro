UPDATE storage.buckets
SET public = true
WHERE id = 'avatars';

DROP POLICY IF EXISTS "Users can view their own avatar" ON storage.objects;

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
