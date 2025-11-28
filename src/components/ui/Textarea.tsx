import { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, helperText, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-bronze-canvas-primary-text mb-2">
                        {label}
                        {props.required && <span className="text-bronze-canvas-accent ml-1">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={`
                        w-full px-3 py-2 
                        bg-bronze-canvas-background 
                        border rounded-lg
                        text-bronze-canvas-primary-text
                        placeholder:text-bronze-canvas-secondary-text
                        focus:outline-none focus:ring-2 focus:ring-bronze-canvas-accent focus:border-transparent
                        disabled:opacity-50 disabled:cursor-not-allowed
                        resize-none
                        transition-all
                        ${error ? 'border-red-500' : 'border-bronze-canvas-border'}
                        ${className}
                    `}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-xs text-red-500">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1 text-xs text-bronze-canvas-secondary-text">{helperText}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
