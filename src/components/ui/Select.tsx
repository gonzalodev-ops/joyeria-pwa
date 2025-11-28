import { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, helperText, options, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-bronze-canvas-primary-text mb-2">
                        {label}
                        {props.required && <span className="text-bronze-canvas-accent ml-1">*</span>}
                    </label>
                )}
                <select
                    ref={ref}
                    className={`
                        w-full px-3 py-2 
                        bg-bronze-canvas-background 
                        border rounded-lg
                        text-bronze-canvas-primary-text
                        focus:outline-none focus:ring-2 focus:ring-bronze-canvas-accent focus:border-transparent
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all
                        ${error ? 'border-red-500' : 'border-bronze-canvas-border'}
                        ${className}
                    `}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
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

Select.displayName = 'Select';
