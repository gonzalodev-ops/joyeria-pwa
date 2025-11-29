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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
            <Card className="max-w-md w-full p-8 m-4">
                <div className="text-center mb-6">
                    <MaterialIcon
                        icon={progress.status === 'completed' ? 'check_circle' : 'progress_activity'}
                        size={48}
                        className={`mx-auto ${progress.status === 'completed' ? 'text-green-500' : 'text-bronze-canvas-accent animate-spin'}`}
                    />
                    <h2 className="text-2xl font-bold mt-4 text-bronze-canvas-primary-text">
                        {progress.status === 'completed' ? '¡Completado!' : 'Procesando imágenes...'}
                    </h2>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2 text-bronze-canvas-secondary-text">
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
