import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, MaterialIcon } from './ui';
import { logger } from '../lib/errors';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo });

        // Log to our centralized error system
        logger.error('React Error Boundary caught an error', error, {
            componentStack: errorInfo.componentStack,
            errorBoundary: true
        });
    }

    private handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });

        // Call custom reset handler if provided
        this.props.onReset?.();

        // Reload the page as last resort
        window.location.reload();
    };

    private handleReportError = () => {
        const { error, errorInfo } = this.state;

        // Create error report
        const report = {
            error: error?.toString(),
            stack: error?.stack,
            componentStack: errorInfo?.componentStack,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };

        // Copy to clipboard
        navigator.clipboard.writeText(JSON.stringify(report, null, 2))
            .then(() => alert('Error copiado al portapapeles. Por favor, compártelo con soporte.'))
            .catch(() => console.error('Failed to copy error report'));
    };

    public render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            const { error } = this.state;
            const isDev = import.meta.env.DEV;

            return (
                <div className="min-h-screen bg-bronze-canvas-background flex items-center justify-center p-4">
                    <div className="max-w-2xl w-full">
                        {/* Error Card */}
                        <div className="bg-bronze-canvas-surface border border-bronze-canvas-border rounded-2xl p-8 shadow-lg">
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                                    <MaterialIcon
                                        icon="error"
                                        size={48}
                                        className="text-red-500"
                                    />
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl font-bold text-bronze-canvas-primary-text text-center mb-3">
                                Algo salió mal
                            </h1>

                            {/* Description */}
                            <p className="text-bronze-canvas-secondary-text text-center mb-6">
                                La aplicación encontró un error inesperado. Puedes intentar recargar la página o reportar el problema.
                            </p>

                            {/* Error Details (Dev Only) */}
                            {isDev && error && (
                                <div className="mb-6 p-4 bg-bronze-canvas-background border border-bronze-canvas-border rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MaterialIcon icon="bug_report" size={20} className="text-bronze-canvas-accent" />
                                        <span className="text-sm font-semibold text-bronze-canvas-primary-text">
                                            Detalles del Error (Solo en Desarrollo)
                                        </span>
                                    </div>
                                    <pre className="text-xs text-red-400 overflow-auto max-h-40 font-mono">
                                        {error.toString()}
                                        {error.stack && `\n\n${error.stack}`}
                                    </pre>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    onClick={this.handleReset}
                                    variant="primary"
                                    className="flex-1"
                                >
                                    <MaterialIcon icon="refresh" size={20} />
                                    Recargar Aplicación
                                </Button>

                                <Button
                                    onClick={this.handleReportError}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    <MaterialIcon icon="content_copy" size={20} />
                                    Copiar Error
                                </Button>
                            </div>

                            {/* Help Text */}
                            <p className="text-xs text-bronze-canvas-secondary-text text-center mt-6">
                                Si el problema persiste, intenta limpiar el caché del navegador o contacta a soporte.
                            </p>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="text-sm text-bronze-canvas-accent hover:underline"
                            >
                                ← Volver al inicio
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

