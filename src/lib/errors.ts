/**
 * Error Management System
 * 
 * Provides centralized error handling with:
 * - Typed error classes for different scenarios
 * - Structured logging (dev vs production)
 * - User-friendly error messages
 * - Error tracking integration ready
 */

// ============================================================================
// Error Types
// ============================================================================

export const enum ErrorType {
    NETWORK = 'NETWORK',
    VALIDATION = 'VALIDATION',
    API = 'API',
    STORAGE = 'STORAGE',
    PROCESSING = 'PROCESSING',
    UNKNOWN = 'UNKNOWN'
}

export const enum ErrorSeverity {
    LOW = 'LOW',       // Non-critical, user can continue
    MEDIUM = 'MEDIUM', // Important but recoverable
    HIGH = 'HIGH',     // Critical, blocks user flow
    FATAL = 'FATAL'    // App-breaking error
}

// ============================================================================
// Custom Error Classes
// ============================================================================

export class AppError extends Error {
    public readonly type: ErrorType;
    public readonly severity: ErrorSeverity;
    public readonly userMessage: string;
    public readonly originalError?: unknown;
    public readonly timestamp: Date;
    public readonly context?: Record<string, unknown>;

    constructor(
        message: string,
        type: ErrorType = ErrorType.UNKNOWN,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        userMessage?: string,
        originalError?: unknown,
        context?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'AppError';
        this.type = type;
        this.severity = severity;
        this.userMessage = userMessage || this.getDefaultUserMessage(type);
        this.originalError = originalError;
        this.timestamp = new Date();
        this.context = context;

        // Maintains proper stack trace for where our error was thrown
        if ((Error as any).captureStackTrace) {
            (Error as any).captureStackTrace(this, AppError);
        }
    }

    private getDefaultUserMessage(type: ErrorType): string {
        const messages: Record<ErrorType, string> = {
            [ErrorType.NETWORK]: 'Error de conexión. Por favor, verifica tu internet.',
            [ErrorType.VALIDATION]: 'Los datos proporcionados no son válidos.',
            [ErrorType.API]: 'Error al comunicarse con el servidor.',
            [ErrorType.STORAGE]: 'Error al guardar los datos.',
            [ErrorType.PROCESSING]: 'Error al procesar la imagen.',
            [ErrorType.UNKNOWN]: 'Ha ocurrido un error inesperado.'
        };
        return messages[type];
    }
}

export class NetworkError extends AppError {
    constructor(message: string, userMessage?: string, originalError?: unknown) {
        super(message, ErrorType.NETWORK, ErrorSeverity.MEDIUM, userMessage, originalError);
        this.name = 'NetworkError';
    }
}

export class ValidationError extends AppError {
    constructor(message: string, userMessage?: string, context?: Record<string, unknown>) {
        super(message, ErrorType.VALIDATION, ErrorSeverity.LOW, userMessage, undefined, context);
        this.name = 'ValidationError';
    }
}

export class APIError extends AppError {
    public readonly statusCode?: number;

    constructor(
        message: string,
        statusCode?: number,
        userMessage?: string,
        originalError?: unknown
    ) {
        super(message, ErrorType.API, ErrorSeverity.MEDIUM, userMessage, originalError, { statusCode });
        this.name = 'APIError';
        this.statusCode = statusCode;
    }
}

export class StorageError extends AppError {
    constructor(message: string, userMessage?: string, originalError?: unknown) {
        super(message, ErrorType.STORAGE, ErrorSeverity.HIGH, userMessage, originalError);
        this.name = 'StorageError';
    }
}

export class ProcessingError extends AppError {
    constructor(message: string, userMessage?: string, originalError?: unknown) {
        super(message, ErrorType.PROCESSING, ErrorSeverity.MEDIUM, userMessage, originalError);
        this.name = 'ProcessingError';
    }
}

// ============================================================================
// Error Logger
// ============================================================================

interface LogEntry {
    timestamp: Date;
    level: 'error' | 'warn' | 'info';
    message: string;
    error?: AppError;
    context?: Record<string, unknown>;
}

class ErrorLogger {
    private isDevelopment = import.meta.env.DEV;
    private logs: LogEntry[] = [];
    private maxLogs = 100; // Keep last 100 logs in memory

    /**
     * Log an error with structured data
     */
    error(message: string, error?: unknown, context?: Record<string, unknown>): void {
        const appError = this.normalizeError(error);

        const entry: LogEntry = {
            timestamp: new Date(),
            level: 'error',
            message,
            error: appError,
            context
        };

        this.addLog(entry);

        if (this.isDevelopment) {
            console.group(`🔴 ERROR: ${message}`);
            console.error('Message:', message);
            if (appError) {
                console.error('Type:', appError.type);
                console.error('Severity:', appError.severity);
                console.error('User Message:', appError.userMessage);
                if (appError.originalError) {
                    console.error('Original Error:', appError.originalError);
                }
            }
            if (context) {
                console.error('Context:', context);
            }
            console.groupEnd();
        } else {
            // In production, send to error tracking service (e.g., Sentry)
            this.sendToErrorTracking(entry);
        }
    }

    /**
     * Log a warning
     */
    warn(message: string, context?: Record<string, unknown>): void {
        const entry: LogEntry = {
            timestamp: new Date(),
            level: 'warn',
            message,
            context
        };

        this.addLog(entry);

        if (this.isDevelopment) {
            console.warn(`⚠️ WARNING: ${message}`, context);
        }
    }

    /**
     * Log info (only in development)
     */
    info(message: string, context?: Record<string, unknown>): void {
        if (this.isDevelopment) {
            console.info(`ℹ️ INFO: ${message}`, context);
        }
    }

    /**
     * Get recent logs (for debugging)
     */
    getRecentLogs(count = 10): LogEntry[] {
        return this.logs.slice(-count);
    }

    /**
     * Clear all logs
     */
    clearLogs(): void {
        this.logs = [];
    }

    private addLog(entry: LogEntry): void {
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift(); // Remove oldest log
        }
    }

    private normalizeError(error: unknown): AppError | undefined {
        if (error instanceof AppError) {
            return error;
        }
        if (error instanceof Error) {
            return new AppError(error.message, ErrorType.UNKNOWN, ErrorSeverity.MEDIUM, undefined, error);
        }
        if (typeof error === 'string') {
            return new AppError(error);
        }
        return undefined;
    }

    private sendToErrorTracking(entry: LogEntry): void {
        // TODO: Integrate with Sentry or similar service
        // Example:
        // Sentry.captureException(entry.error?.originalError || entry.error, {
        //   level: 'error',
        //   extra: entry.context
        // });
        console.error('[Production Error]', entry);
    }
}

export const logger = new ErrorLogger();

// ============================================================================
// Error Utilities
// ============================================================================

/**
 * Safely execute an async function with error handling
 */
export async function safeAsync<T>(
    fn: () => Promise<T>,
    errorMessage: string,
    context?: Record<string, unknown>
): Promise<{ data?: T; error?: AppError }> {
    try {
        const data = await fn();
        return { data };
    } catch (error) {
        const appError = error instanceof AppError
            ? error
            : new AppError(errorMessage, ErrorType.UNKNOWN, ErrorSeverity.MEDIUM, undefined, error, context);

        logger.error(errorMessage, appError, context);
        return { error: appError };
    }
}

/**
 * Safely execute a sync function with error handling
 */
export function safeSync<T>(
    fn: () => T,
    errorMessage: string,
    context?: Record<string, unknown>
): { data?: T; error?: AppError } {
    try {
        const data = fn();
        return { data };
    } catch (error) {
        const appError = error instanceof AppError
            ? error
            : new AppError(errorMessage, ErrorType.UNKNOWN, ErrorSeverity.MEDIUM, undefined, error, context);

        logger.error(errorMessage, appError, context);
        return { error: appError };
    }
}

/**
 * Get user-friendly error message from any error
 */
export function getUserMessage(error: unknown): string {
    if (error instanceof AppError) {
        return error.userMessage;
    }
    if (error instanceof Error) {
        return 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.';
    }
    return 'Error desconocido. Por favor, intenta de nuevo.';
}

/**
 * Check if error is retryable
 */
export function isRetryable(error: unknown): boolean {
    if (error instanceof AppError) {
        return error.type === ErrorType.NETWORK || error.type === ErrorType.API;
    }
    return false;
}
