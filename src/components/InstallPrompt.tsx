import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const handleDismiss = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 p-4 rounded-2xl shadow-2xl flex items-start gap-4">
                <div className="bg-blue-600/20 p-3 rounded-xl text-blue-400">
                    <Smartphone size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-zinc-100">Instalar Aplicación</h3>
                    <p className="text-sm text-zinc-400 mt-1">
                        Instala Jewelry AI Studio en tu dispositivo para un acceso más rápido y mejor rendimiento.
                    </p>
                    <div className="flex gap-3 mt-3">
                        <button
                            onClick={handleInstall}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Download size={16} />
                            Instalar
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="px-4 py-2 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg text-sm font-medium transition-colors"
                        >
                            Ahora no
                        </button>
                    </div>
                </div>
                <button
                    onClick={handleDismiss}
                    className="text-zinc-500 hover:text-zinc-300 -mt-1 -mr-1"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
