
-- Storage policies for puppy-media bucket: allow authenticated admins to manage files, allow anyone to read via signed URLs
CREATE POLICY "Admins can upload puppy media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'puppy-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update puppy media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'puppy-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete puppy media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'puppy-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can read puppy media"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'puppy-media');
