-- ==============================================================================
-- KAIRO — UPDATE FILE LIMITS MIGRATION (003)
-- Increases storage bucket file size limit to 100MB (104857600 bytes)
-- and updates allowed MIME types for print files.
-- ==============================================================================

UPDATE storage.buckets
SET 
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
WHERE id = 'print-files';
