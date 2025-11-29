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
        // Nota: En un entorno real, subiríamos a un bucket temporal de Supabase o Cloudinary
        // Para este MVP, asumiremos que subimos a Cloudinary directamente
        const uploadPromises = imageFiles.map(async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', 'temp-batch');

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: 'POST', body: formData }
            );

            if (!response.ok) {
                throw new Error(`Failed to upload image: ${response.statusText}`);
            }

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
