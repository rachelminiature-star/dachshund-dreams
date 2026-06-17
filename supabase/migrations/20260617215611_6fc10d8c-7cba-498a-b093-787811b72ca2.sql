
-- Restrict SECURITY DEFINER function execution
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO authenticated, service_role;

-- Storage policies on puppy-media bucket
CREATE POLICY "puppy-media public read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'puppy-media');

CREATE POLICY "puppy-media admin insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'puppy-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "puppy-media admin update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'puppy-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "puppy-media admin delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'puppy-media' AND public.has_role(auth.uid(), 'admin'));
