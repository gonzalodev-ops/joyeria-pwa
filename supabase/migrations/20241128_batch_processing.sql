-- Tabla de Jobs (trabajos de procesamiento)
CREATE TABLE processing_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  total_images INTEGER NOT NULL,
  processed_images INTEGER DEFAULT 0,
  failed_images INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB -- configuraciones del lote
);

-- Tabla de Items individuales del Job
CREATE TABLE processing_job_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES processing_jobs(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL, -- URL original
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  result_url TEXT, -- URL de imagen procesada
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_jobs_user_status ON processing_jobs(user_id, status);
CREATE INDEX idx_job_items_job_status ON processing_job_items(job_id, status);
CREATE INDEX idx_jobs_pending ON processing_jobs(status) WHERE status = 'pending';

-- Función para obtener siguiente item a procesar
CREATE OR REPLACE FUNCTION get_next_job_item()
RETURNS TABLE (
  job_item_id UUID,
  job_id UUID,
  image_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  UPDATE processing_job_items
  SET status = 'processing'
  WHERE id = (
    SELECT pji.id
    FROM processing_job_items pji
    JOIN processing_jobs pj ON pji.job_id = pj.id
    WHERE pji.status = 'pending'
      AND pj.status IN ('pending', 'processing')
    ORDER BY pji.created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING id, processing_job_items.job_id, processing_job_items.image_url;
END;
$$ LANGUAGE plpgsql;

-- Función para incrementar contador de procesados
CREATE OR REPLACE FUNCTION increment_job_processed(job_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE processing_jobs
  SET processed_images = processed_images + 1
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;

-- Función para incrementar contador de fallidos
CREATE OR REPLACE FUNCTION increment_job_failed(job_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE processing_jobs
  SET failed_images = failed_images + 1
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;
