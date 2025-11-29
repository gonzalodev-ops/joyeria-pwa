import { useState, useEffect, useCallback } from 'react';
import { getImages, getCatalogs } from '../services/database';
import { logger } from '../lib/errors';

export function useAppStats() {
    const [stats, setStats] = useState({ processed: 0, catalogs: 0 });
    const [loading, setLoading] = useState(true);

    const loadStats = useCallback(async () => {
        try {
            setLoading(true);
            const [images, catalogs] = await Promise.all([
                getImages(),
                getCatalogs()
            ]);
            setStats({
                processed: images.length,
                catalogs: catalogs.length
            });
        } catch (error) {
            logger.error('Error loading stats', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    return { stats, loading, refreshStats: loadStats };
}
