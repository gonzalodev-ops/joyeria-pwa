import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Initialize Supabase Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Get next pending item
        const { data: items, error: fetchError } = await supabase.rpc('get_next_job_item');

        if (fetchError) throw fetchError;
        if (!items || items.length === 0) {
            return new Response(JSON.stringify({ message: 'No pending items' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const item = items[0];
        console.log(`Processing item: ${item.job_item_id}`);

        try {
            // 2. Process Image (Remove Background + Analyze)
            // A. Remove Background (PhotoRoom)
            const photoRoomApiKey = Deno.env.get('PHOTOROOM_API_KEY');
            if (!photoRoomApiKey) throw new Error('Missing PHOTOROOM_API_KEY');

            const photoRoomResponse = await fetch('https://sdk.photoroom.com/v1/segment', {
                method: 'POST',
                headers: {
                    'X-Api-Key': photoRoomApiKey,
                },
                body: await fetch(item.image_url).then(r => r.blob()), // Send image blob
            });

            if (!photoRoomResponse.ok) {
                throw new Error(`PhotoRoom API Error: ${photoRoomResponse.statusText}`);
            }

            const processedBlob = await photoRoomResponse.blob();

            // Upload processed image to Supabase Storage (or Cloudinary)
            // For this MVP, we'll assume we upload back to a 'processed' bucket in Supabase
            // NOTE: You need to create a 'processed-images' bucket in Supabase Storage
            const fileName = `${item.job_id}/${item.job_item_id}.png`;
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('processed-images')
                .upload(fileName, processedBlob, {
                    contentType: 'image/png',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase
                .storage
                .from('processed-images')
                .getPublicUrl(fileName);

            // B. Analyze Image (Gemini) - Optional: Call existing analyze-image function
            // For simplicity in this worker, we'll skip calling the other function to avoid complexity
            // and just mark it done. In a real prod env, we'd call the analyze logic here.

            // 3. Update Item Status
            await supabase
                .from('processing_job_items')
                .update({
                    status: 'completed',
                    result_url: publicUrl,
                    processed_at: new Date().toISOString(),
                })
                .eq('id', item.job_item_id);

            // 4. Update Job Progress
            await supabase.rpc('increment_job_processed', { job_id: item.job_id });

            // 5. Check Job Completion
            const { data: job } = await supabase
                .from('processing_jobs')
                .select('total_images, processed_images, failed_images')
                .eq('id', item.job_id)
                .single();

            if (job && (job.processed_images + job.failed_images) >= job.total_images) {
                await supabase
                    .from('processing_jobs')
                    .update({
                        status: 'completed',
                        completed_at: new Date().toISOString(),
                    })
                    .eq('id', item.job_id);
            }

            return new Response(JSON.stringify({ success: true, itemId: item.job_item_id }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });

        } catch (processError: any) {
            console.error('Processing error:', processError);

            // Handle Failure
            await supabase
                .from('processing_job_items')
                .update({
                    status: 'failed',
                    error_message: processError.message,
                })
                .eq('id', item.job_item_id);

            await supabase.rpc('increment_job_failed', { job_id: item.job_id });

            return new Response(JSON.stringify({ error: processError.message }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
