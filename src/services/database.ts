import { supabase } from './supabase';

export interface ImageRecord {
    id?: string;
    created_at?: string;
    url: string;
    original_url?: string;
    title: string;
    category: string;
    description?: string;
    material?: string;
    metadata?: Record<string, any>;
}

export interface CatalogRecord {
    id?: string;
    created_at?: string;
    title: string;
    description?: string;
    status: 'draft' | 'published';
    cover_url?: string;
    views?: number;
    background_color?: string;
    logo_url?: string;
}

export interface CatalogWithItems extends CatalogRecord {
    itemCount?: number;
    images?: ImageRecord[];
}

// ============ IMAGE OPERATIONS ============

export async function saveImage(image: ImageRecord): Promise<ImageRecord | null> {
    try {
        const { data, error } = await supabase
            .from('images')
            .insert([image])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error saving image:', error);
        throw error;
    }
}

export async function getImages(category?: string): Promise<ImageRecord[]> {
    try {
        let query = supabase
            .from('images')
            .select('*')
            .order('created_at', { ascending: false });

        if (category && category !== 'All') {
            query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching images:', error);
        throw error;
    }
}

export async function updateImage(id: string, updates: Partial<ImageRecord>): Promise<ImageRecord | null> {
    try {
        const { data, error } = await supabase
            .from('images')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating image:', error);
        throw error;
    }
}

export async function deleteImage(id: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('images')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
}

// ============ CATALOG OPERATIONS ============

export async function createCatalog(catalog: CatalogRecord): Promise<CatalogRecord | null> {
    try {
        const { data, error } = await supabase
            .from('catalogs')
            .insert([catalog])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating catalog:', error);
        throw error;
    }
}

export async function getCatalogs(): Promise<CatalogWithItems[]> {
    try {
        const { data: catalogs, error } = await supabase
            .from('catalogs')
            .select(`
        *,
        catalog_items (
          image_id
        )
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to include item count
        const catalogsWithCount = catalogs?.map(catalog => ({
            ...catalog,
            itemCount: catalog.catalog_items?.length || 0,
        })) || [];

        return catalogsWithCount;
    } catch (error) {
        console.error('Error fetching catalogs:', error);
        throw error;
    }
}

export async function getCatalogById(id: string): Promise<CatalogWithItems | null> {
    try {
        const { data: catalog, error: catalogError } = await supabase
            .from('catalogs')
            .select('*')
            .eq('id', id)
            .single();

        if (catalogError) throw catalogError;

        // Get catalog items with full image data
        const { data: items, error: itemsError } = await supabase
            .from('catalog_items')
            .select(`
        image_id,
        images (*)
      `)
            .eq('catalog_id', id);

        if (itemsError) throw itemsError;

        return {
            ...catalog,
            itemCount: items?.length || 0,
            images: items?.map(item => item.images).filter(Boolean) || [],
        };
    } catch (error) {
        console.error('Error fetching catalog:', error);
        throw error;
    }
}

export async function updateCatalog(id: string, updates: Partial<CatalogRecord>): Promise<CatalogRecord | null> {
    try {
        const { data, error } = await supabase
            .from('catalogs')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating catalog:', error);
        throw error;
    }
}

export async function deleteCatalog(id: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('catalogs')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting catalog:', error);
        throw error;
    }
}

export async function addImageToCatalog(catalogId: string, imageId: string): Promise<void> {
    try {
        // Get current max position
        const { data: items } = await supabase
            .from('catalog_items')
            .select('position')
            .eq('catalog_id', catalogId)
            .order('position', { ascending: false })
            .limit(1);

        const nextPosition = (items && items.length > 0 && items[0].position !== null) ? items[0].position + 1 : 0;

        const { error } = await supabase
            .from('catalog_items')
            .insert([{
                catalog_id: catalogId,
                image_id: imageId,
                position: nextPosition
            }]);

        if (error) throw error;
    } catch (error) {
        console.error('Error adding image to catalog:', error);
        throw error;
    }
}

export async function removeImageFromCatalog(catalogId: string, imageId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('catalog_items')
            .delete()
            .eq('catalog_id', catalogId)
            .eq('image_id', imageId);

        if (error) throw error;
    } catch (error) {
        console.error('Error removing image from catalog:', error);
        throw error;
    }
}

export async function getImagesInCatalog(catalogId: string): Promise<ImageRecord[]> {
    try {
        const { data, error } = await supabase
            .from('catalog_items')
            .select(`
                position,
                images (*)
            `)
            .eq('catalog_id', catalogId)
            .order('position', { ascending: true });

        if (error) throw error;

        // Extract images from the joined data
        const images = data?.map(item => (item as any).images).filter(Boolean) || [];
        return images;
    } catch (error) {
        console.error('Error fetching catalog images:', error);
        throw error;
    }
}

export async function updateCatalogItemPositions(catalogId: string, items: { imageId: string, position: number }[]): Promise<void> {
    try {
        // We can use the RPC function if created, or update one by one for now (less efficient but works without RPC)
        // Using RPC is better, but let's assume the user might not have run the migration yet or RPC creation failed.
        // Let's try to use upsert on catalog_items if possible, but we need the PK.
        // The PK is (catalog_id, image_id).

        const updates = items.map(item => ({
            catalog_id: catalogId,
            image_id: item.imageId,
            position: item.position
        }));

        const { error } = await supabase
            .from('catalog_items')
            .upsert(updates, { onConflict: 'catalog_id,image_id' });

        if (error) throw error;
    } catch (error) {
        console.error('Error updating positions:', error);
        throw error;
    }
}

export async function incrementCatalogViews(id: string): Promise<void> {
    try {
        const { data: catalog } = await supabase
            .from('catalogs')
            .select('views')
            .eq('id', id)
            .single();

        if (catalog) {
            await supabase
                .from('catalogs')
                .update({ views: (catalog.views || 0) + 1 })
                .eq('id', id);
        }
    } catch (error) {
        console.error('Error incrementing catalog views:', error);
        // Don't throw, this is not critical
    }
}
