# Sistema de Procesamiento por Lotes (Batch Processing)

**Fecha:** 28 de Noviembre, 2024  
**Objetivo:** Procesar 200-300 imágenes/día por cliente de forma eficiente

## 1. Problema a Resolver

### Escenario Actual
```
Usuario sube 50 imágenes → 50 requests simultáneas → 💥 PROBLEMA
```

**Problemas:**
- ❌ Sobrecarga del navegador (50 requests a la vez)
- ❌ Rate limiting agresivo bloquea al usuario
- ❌ Costos de API impredecibles
- ❌ Mala UX (usuario esperando sin feedback)
- ❌ Fallas en red afectan todo el lote

### Solución: Sistema de Colas
```
Usuario sube 50 imágenes → Cola de Jobs → Procesamiento controlado → ✅ ÉXITO
```

**Beneficios:**
- ✅ Procesamiento controlado (5-10 a la vez)
- ✅ Feedback de progreso en tiempo real
- ✅ Reintentos automáticos en caso de falla
- ✅ Costos predecibles
- ✅ Usuario puede cerrar la app y volver después

---

## 2. Arquitectura del Sistema

### 2.1 Base de Datos (Supabase)

```sql
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
```

### 2.2 Frontend: Crear Job

```typescript
// src/services/batchProcessing.ts

import { supabase } from './supabase';
import { logger } from '../lib/errors';

export interface BatchJobConfig {
  removeBackground: boolean;
  analyzeMetadata: boolean;
  applyWatermark: boolean;
  outputFormat: 'jpeg' | 'png' | 'webp';
}

export async function createBatchJob(
  imageFiles: File[],
  config: BatchJobConfig
): Promise<string> {
  try {
    // 1. Subir imágenes a Cloudinary (o storage temporal)
    const uploadPromises = imageFiles.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'temp-batch');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      const data = await response.json();
      return data.secure_url;
    });

    const imageUrls = await Promise.all(uploadPromises);

    // 2. Crear Job en Supabase
    const { data: job, error: jobError } = await supabase
      .from('processing_jobs')
      .insert({
        total_images: imageUrls.length,
        metadata: config,
      })
      .select()
      .single();

    if (jobError) throw jobError;

    // 3. Crear items del job
    const jobItems = imageUrls.map((url) => ({
      job_id: job.id,
      image_url: url,
    }));

    const { error: itemsError } = await supabase
      .from('processing_job_items')
      .insert(jobItems);

    if (itemsError) throw itemsError;

    logger.info(`Batch job created: ${job.id} with ${imageUrls.length} images`);

    return job.id;
  } catch (error) {
    logger.error('Failed to create batch job', error);
    throw error;
  }
}

export async function getJobStatus(jobId: string) {
  const { data, error } = await supabase
    .from('processing_jobs')
    .select(`
      *,
      items:processing_job_items(count)
    `)
    .eq('id', jobId)
    .single();

  if (error) throw error;
  return data;
}

// Suscripción en tiempo real al progreso
export function subscribeToJobProgress(
  jobId: string,
  onProgress: (progress: { processed: number; total: number; status: string }) => void
) {
  const subscription = supabase
    .channel(`job:${jobId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'processing_jobs',
        filter: `id=eq.${jobId}`,
      },
      (payload) => {
        const job = payload.new;
        onProgress({
          processed: job.processed_images,
          total: job.total_images,
          status: job.status,
        });
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}
```

### 2.3 Backend: Worker (Edge Function)

Crear: `supabase/functions/batch-worker/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const CONCURRENT_LIMIT = 5; // Procesar 5 imágenes a la vez
const MAX_RETRIES = 3;

async function processImage(imageUrl: string, config: any) {
  // 1. Remove background
  const bgRemovedUrl = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/remove-background`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl }),
  }).then(r => r.json());

  // 2. Analyze metadata
  const metadata = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/analyze-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl: bgRemovedUrl.url }),
  }).then(r => r.json());

  // 3. Save to final storage
  // ... guardar en Cloudinary permanente

  return {
    resultUrl: bgRemovedUrl.url,
    metadata,
  };
}

async function processNextBatch() {
  console.log('🔄 Processing next batch...');

  // Obtener siguiente lote de items pendientes
  const { data: items, error } = await supabase.rpc('get_next_job_item');

  if (error) {
    console.error('Error getting next items:', error);
    return;
  }

  if (!items || items.length === 0) {
    console.log('✅ No pending items');
    return;
  }

  // Procesar en paralelo (limitado)
  const processingPromises = items.slice(0, CONCURRENT_LIMIT).map(async (item) => {
    try {
      console.log(`📸 Processing item ${item.job_item_id}`);

      const result = await processImage(item.image_url, {});

      // Marcar como completado
      await supabase
        .from('processing_job_items')
        .update({
          status: 'completed',
          result_url: result.resultUrl,
          processed_at: new Date().toISOString(),
        })
        .eq('id', item.job_item_id);

      // Actualizar contador del job
      await supabase.rpc('increment_job_processed', { job_id: item.job_id });

      console.log(`✅ Completed item ${item.job_item_id}`);
    } catch (error) {
      console.error(`❌ Failed item ${item.job_item_id}:`, error);

      // Incrementar retry count
      const { data: currentItem } = await supabase
        .from('processing_job_items')
        .select('retry_count')
        .eq('id', item.job_item_id)
        .single();

      if (currentItem && currentItem.retry_count < MAX_RETRIES) {
        // Reintentar
        await supabase
          .from('processing_job_items')
          .update({
            status: 'pending',
            retry_count: currentItem.retry_count + 1,
          })
          .eq('id', item.job_item_id);
      } else {
        // Marcar como fallido
        await supabase
          .from('processing_job_items')
          .update({
            status: 'failed',
            error_message: error.message,
          })
          .eq('id', item.job_item_id);

        await supabase.rpc('increment_job_failed', { job_id: item.job_id });
      }
    }
  });

  await Promise.allSettled(processingPromises);

  // Verificar si el job está completo
  await checkJobCompletion(items[0].job_id);
}

async function checkJobCompletion(jobId: string) {
  const { data: job } = await supabase
    .from('processing_jobs')
    .select('total_images, processed_images, failed_images')
    .eq('id', jobId)
    .single();

  if (job && (job.processed_images + job.failed_images) >= job.total_images) {
    await supabase
      .from('processing_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    console.log(`🎉 Job ${jobId} completed!`);
  }
}

// Endpoint invocado por Cron cada minuto
serve(async (req) => {
  if (req.method === 'POST') {
    await processNextBatch();
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method not allowed', { status: 405 });
});
```

### 2.4 Configurar Cron Job

En Supabase Dashboard → Database → Cron Jobs:

```sql
-- Ejecutar worker cada minuto
SELECT cron.schedule(
  'process-batch-jobs',
  '* * * * *', -- Cada minuto
  $$
  SELECT net.http_post(
    url := 'https://xxx.supabase.co/functions/v1/batch-worker',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer xxx"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

---

## 3. UI Component: Batch Progress

```tsx
// src/components/BatchProgressModal.tsx

import { useEffect, useState } from 'react';
import { subscribeToJobProgress } from '../services/batchProcessing';
import { MaterialIcon, Card } from './ui';

interface BatchProgressModalProps {
  jobId: string;
  onComplete: () => void;
}

export function BatchProgressModal({ jobId, onComplete }: BatchProgressModalProps) {
  const [progress, setProgress] = useState({ processed: 0, total: 0, status: 'pending' });

  useEffect(() => {
    const unsubscribe = subscribeToJobProgress(jobId, (newProgress) => {
      setProgress(newProgress);
      
      if (newProgress.status === 'completed') {
        setTimeout(onComplete, 2000); // Cerrar después de 2s
      }
    });

    return unsubscribe;
  }, [jobId, onComplete]);

  const percentage = progress.total > 0 
    ? Math.round((progress.processed / progress.total) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-6">
          <MaterialIcon 
            icon={progress.status === 'completed' ? 'check_circle' : 'hourglass_empty'} 
            size={48}
            className={progress.status === 'completed' ? 'text-green-500' : 'text-bronze-canvas-accent'}
          />
          <h2 className="text-2xl font-bold mt-4">
            {progress.status === 'completed' ? '¡Completado!' : 'Procesando imágenes...'}
          </h2>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>{progress.processed} de {progress.total}</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full bg-bronze-canvas-border rounded-full h-3 overflow-hidden">
            <div 
              className="bg-bronze-canvas-accent h-full transition-all duration-300 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <p className="text-sm text-bronze-canvas-secondary-text text-center">
          {progress.status === 'completed' 
            ? 'Todas las imágenes han sido procesadas exitosamente.'
            : 'Puedes cerrar esta ventana. Te notificaremos cuando termine.'}
        </p>
      </Card>
    </div>
  );
}
```

---

## 4. Costos y Escalabilidad

### Estimación de Costos (300 imágenes/día)

| Servicio | Costo por Imagen | 300 img/día | Mensual |
|----------|------------------|-------------|---------|
| **PhotoRoom API** | $0.02 | $6/día | ~$180/mes |
| **Gemini API** | $0.001 | $0.30/día | ~$9/mes |
| **Cloudinary** | Incluido | $0 | $0 (plan gratis) |
| **Supabase** | Incluido | $0 | $0 (plan gratis) |
| **Upstash Redis** | Incluido | $0 | $0 (plan gratis) |
| **TOTAL** | ~$0.021 | **$6.30/día** | **~$189/mes** |

### Pricing Sugerido para Rentabilidad

| Plan | Imágenes/Mes | Costo Operativo | Precio | Margen |
|------|--------------|-----------------|--------|--------|
| Starter | 300 | $6.30 | **$29** | 78% 💰 |
| Professional | 1000 | $21 | **$99** | 79% 💰 |
| Enterprise | 3000+ | $63+ | **$299+** | 79% 💰 |

---

## 5. Próximos Pasos

### Fase 1: MVP del Sistema de Colas
- [ ] Crear tablas en Supabase
- [ ] Implementar `createBatchJob` en frontend
- [ ] Crear Edge Function `batch-worker`
- [ ] Configurar Cron job
- [ ] UI de progreso básica

### Fase 2: Mejoras
- [ ] Notificaciones push cuando termine el lote
- [ ] Dashboard de historial de jobs
- [ ] Pausar/reanudar jobs
- [ ] Priorización de jobs (planes premium primero)

### Fase 3: Optimizaciones
- [ ] Cache de resultados de Gemini (metadatos similares)
- [ ] Compresión inteligente de imágenes
- [ ] CDN para entrega rápida

---

**Conclusión:** Con este sistema, un cliente puede subir 300 imágenes, cerrar la app, y volver en 30 minutos a encontrar todo procesado. ✨
