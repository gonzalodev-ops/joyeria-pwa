/**
 * File Validation System
 * 
 * Provides robust validation for uploaded files including:
 * - MIME type verification
 * - Magic number (file signature) validation
 * - File size limits
 * - Image dimension validation
 * - Filename sanitization
 */

import { ValidationError } from './errors';

// ============================================================================
// Configuration
// ============================================================================

export const FILE_VALIDATION_CONFIG = {
    // Maximum file size: 10MB
    MAX_FILE_SIZE: 10 * 1024 * 1024,

    // Maximum image dimensions
    MAX_WIDTH: 8000,
    MAX_HEIGHT: 8000,

    // Minimum image dimensions
    MIN_WIDTH: 100,
    MIN_HEIGHT: 100,

    // Allowed MIME types
    ALLOWED_MIME_TYPES: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/heic',
        'image/heif'
    ],

    // Allowed file extensions
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif']
} as const;

// ============================================================================
// Magic Numbers (File Signatures)
// ============================================================================

const FILE_SIGNATURES: Record<string, number[][]> = {
    'image/jpeg': [
        [0xFF, 0xD8, 0xFF, 0xE0], // JPEG JFIF
        [0xFF, 0xD8, 0xFF, 0xE1], // JPEG Exif
        [0xFF, 0xD8, 0xFF, 0xE2], // JPEG
        [0xFF, 0xD8, 0xFF, 0xE3], // JPEG
        [0xFF, 0xD8, 0xFF, 0xDB]  // JPEG raw
    ],
    'image/png': [
        [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
    ],
    'image/webp': [
        [0x52, 0x49, 0x46, 0x46] // RIFF (WebP starts with RIFF)
    ],
    'image/heic': [
        [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63],
        [0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63]
    ]
};

// ============================================================================
// Validation Results
// ============================================================================

export interface ValidationResult {
    valid: boolean;
    error?: ValidationError;
    warnings?: string[];
}

export interface ImageDimensions {
    width: number;
    height: number;
}

// ============================================================================
// Core Validation Functions
// ============================================================================

/**
 * Validate file MIME type
 */
function validateMimeType(file: File): ValidationResult {
    if (!FILE_VALIDATION_CONFIG.ALLOWED_MIME_TYPES.includes(file.type as any)) {
        return {
            valid: false,
            error: new ValidationError(
                `Invalid MIME type: ${file.type}`,
                `Tipo de archivo no soportado. Por favor, sube una imagen JPG, PNG o WEBP.`,
                { mimeType: file.type, allowedTypes: FILE_VALIDATION_CONFIG.ALLOWED_MIME_TYPES }
            )
        };
    }
    return { valid: true };
    function validateFileSize(file: File): ValidationResult {
        if (file.size > FILE_VALIDATION_CONFIG.MAX_FILE_SIZE) {
            const maxSizeMB = FILE_VALIDATION_CONFIG.MAX_FILE_SIZE / (1024 * 1024);
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

            return {
                valid: false,
                error: new ValidationError(
                    `File too large: ${fileSizeMB}MB`,
                    `El archivo es demasiado grande (${fileSizeMB}MB). El tamaño máximo es ${maxSizeMB}MB.`,
                    { fileSize: file.size, maxSize: FILE_VALIDATION_CONFIG.MAX_FILE_SIZE }
                )
            };
        }

        if (file.size === 0) {
            return {
                valid: false,
                error: new ValidationError(
                    'Empty file',
                    'El archivo está vacío.',
                    { fileSize: 0 }
                )
            };
        }

        return { valid: true };
    }

    /**
     * Validate file signature (magic numbers)
     */
    async function validateFileSignature(file: File): Promise<ValidationResult> {
        try {
            // Read first 12 bytes (enough for most signatures)
            const buffer = await file.slice(0, 12).arrayBuffer();
            const bytes = new Uint8Array(buffer);

            const signatures = FILE_SIGNATURES[file.type];
            if (!signatures) {
                // If we don't have signatures for this type, skip this validation
                return { valid: true };
            }

            // Check if any signature matches
            const isValid = signatures.some(signature =>
                signature.every((byte, index) => bytes[index] === byte)
            );

            if (!isValid) {
                return {
                    valid: false,
                    error: new ValidationError(
                        `File signature mismatch for ${file.type}`,
                        'El archivo no parece ser una imagen válida. Puede estar corrupto.',
                        { mimeType: file.type, fileName: file.name }
                    )
                };
            }

            return { valid: true };
        } catch (error) {
            return {
                valid: false,
                error: new ValidationError(
                    'Failed to read file signature',
                    'No se pudo verificar el archivo.',
                    { originalError: error }
                )
            };
        }
    }

    /**
     * Validate image dimensions
     */
    async function validateImageDimensions(file: File): Promise<ValidationResult> {
        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);

                const warnings: string[] = [];

                // Check maximum dimensions
                if (img.width > FILE_VALIDATION_CONFIG.MAX_WIDTH || img.height > FILE_VALIDATION_CONFIG.MAX_HEIGHT) {
                    resolve({
                        valid: false,
                        error: new ValidationError(
                            `Image too large: ${img.width}x${img.height}`,
                            `La imagen es demasiado grande (${img.width}x${img.height}px). El tamaño máximo es ${FILE_VALIDATION_CONFIG.MAX_WIDTH}x${FILE_VALIDATION_CONFIG.MAX_HEIGHT}px.`,
                            { width: img.width, height: img.height }
                        )
                    });
                    return;
                }

                // Check minimum dimensions
                if (img.width < FILE_VALIDATION_CONFIG.MIN_WIDTH || img.height < FILE_VALIDATION_CONFIG.MIN_HEIGHT) {
                    resolve({
                        valid: false,
                        error: new ValidationError(
                            `Image too small: ${img.width}x${img.height}`,
                            `La imagen es demasiado pequeña (${img.width}x${img.height}px). El tamaño mínimo es ${FILE_VALIDATION_CONFIG.MIN_WIDTH}x${FILE_VALIDATION_CONFIG.MIN_HEIGHT}px.`,
                            { width: img.width, height: img.height }
                        )
                    });
                    return;
                }

                // Warn if image is very large (might be slow to process)
                if (img.width > 4000 || img.height > 4000) {
                    warnings.push('La imagen es muy grande y puede tardar en procesarse.');
                }

                resolve({ valid: true, warnings });
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve({
                    valid: false,
                    error: new ValidationError(
                        'Failed to load image',
                        'No se pudo cargar la imagen. Puede estar corrupta.',
                        { fileName: file.name }
                    )
                });
            };

            img.src = url;
        });
    }

    /**
     * Get image dimensions without full validation
     */
    export async function getImageDimensions(file: File): Promise<ImageDimensions | null> {
        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve({ width: img.width, height: img.height });
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(null);
            };

            img.src = url;
        });
    }

    // ============================================================================
    // Filename Sanitization
    // ============================================================================

    /**
     * Sanitize filename to prevent security issues and ensure compatibility
     */
    export function sanitizeFilename(filename: string): string {
        // Get extension
        const lastDotIndex = filename.lastIndexOf('.');
        const name = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
        const ext = lastDotIndex > 0 ? filename.substring(lastDotIndex) : '';

        // Remove or replace dangerous characters
        let sanitized = name
            .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Remove illegal characters
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .replace(/[^\w\-_.]/g, '') // Keep only alphanumeric, dash, underscore, dot
            .replace(/_{2,}/g, '_') // Replace multiple underscores with single
            .replace(/^\.+/, '') // Remove leading dots
            .substring(0, 200); // Limit length

        // Ensure we have a valid name
        if (!sanitized) {
            sanitized = 'image_' + Date.now();
        }

        return sanitized + ext.toLowerCase();
    }

    // ============================================================================
    // Main Validation Function
    // ============================================================================

    export interface FileValidationOptions {
        checkSignature?: boolean;
        checkDimensions?: boolean;
        sanitizeName?: boolean;
    }

    export interface FileValidationSuccess {
        valid: true;
        sanitizedFilename: string;
        dimensions?: ImageDimensions;
        warnings?: string[];
    }

    export interface FileValidationFailure {
        valid: false;
        error: ValidationError;
    }

    export type FileValidationComplete = FileValidationSuccess | FileValidationFailure;

    /**
     * Comprehensive file validation
     */
    export async function validateImageFile(
        file: File,
        options: FileValidationOptions = {}
    ): Promise<FileValidationComplete> {
        const {
            checkSignature = true,
            checkDimensions = true,
            sanitizeName = true
        } = options;

        const allWarnings: string[] = [];

        // 1. Validate MIME type
        const mimeResult = validateMimeType(file);
        if (!mimeResult.valid) {
            return { valid: false, error: mimeResult.error! };
        }

        // 2. Validate extension
        const extResult = validateExtension(file.name);
        if (!extResult.valid) {
            return { valid: false, error: extResult.error! };
        }

        // 3. Validate file size
        const sizeResult = validateFileSize(file);
        if (!sizeResult.valid) {
            return { valid: false, error: sizeResult.error! };
        }

        // 4. Validate file signature (magic numbers)
        if (checkSignature) {
            const signatureResult = await validateFileSignature(file);
            if (!signatureResult.valid) {
                return { valid: false, error: signatureResult.error! };
            }
        }

        // 5. Validate image dimensions
        let dimensions: ImageDimensions | undefined;
        if (checkDimensions) {
            const dimensionsResult = await validateImageDimensions(file);
            if (!dimensionsResult.valid) {
                return { valid: false, error: dimensionsResult.error! };
            }
            if (dimensionsResult.warnings) {
                allWarnings.push(...dimensionsResult.warnings);
            }

            // Get actual dimensions
            dimensions = await getImageDimensions(file) || undefined;
        }

        // 6. Sanitize filename
        const sanitizedFilename = sanitizeName ? sanitizeFilename(file.name) : file.name;

        return {
            valid: true,
            sanitizedFilename,
            dimensions,
            warnings: allWarnings.length > 0 ? allWarnings : undefined
        };
    }

    /**
     * Quick validation (MIME type and size only)
     */
    export function validateImageFileQuick(file: File): ValidationResult {
        const mimeResult = validateMimeType(file);
        if (!mimeResult.valid) return mimeResult;

        const sizeResult = validateFileSize(file);
        if (!sizeResult.valid) return sizeResult;

        return { valid: true };
    }
