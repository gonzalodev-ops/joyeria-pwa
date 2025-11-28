import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, Check, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, type, message, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100000] flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`
                            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md animate-in slide-in-from-right-full duration-300
                            ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-200' : ''}
                            ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-200' : ''}
                            ${toast.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200' : ''}
                            ${toast.type === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-200' : ''}
                        `}
                    >
                        {toast.type === 'success' && <Check size={18} className="text-green-400" />}
                        {toast.type === 'error' && <AlertCircle size={18} className="text-red-400" />}
                        {toast.type === 'warning' && <AlertTriangle size={18} className="text-yellow-400" />}
                        {toast.type === 'info' && <Info size={18} className="text-blue-400" />}

                        <p className="text-sm font-medium">{toast.message}</p>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
