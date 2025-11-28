import { MaterialIcon } from './MaterialIcon';
import type { IconName } from './MaterialIcon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: IconName;
    iconPosition?: 'left' | 'right';
    loading?: boolean;
    fullWidth?: boolean;
    children: React.ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    loading = false,
    fullWidth = false,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold tracking-wide transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        primary: 'bg-bronze-canvas-accent text-white hover:opacity-90 active:opacity-80',
        secondary: 'bg-bronze-canvas-component-bg text-bronze-canvas-primary-text hover:bg-bronze-canvas-border active:bg-bronze-canvas-border',
        ghost: 'bg-transparent text-bronze-canvas-primary-text hover:bg-bronze-canvas-component-bg active:bg-bronze-canvas-border',
    };

    const sizeStyles = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-5 text-base',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    const iconSize = {
        sm: 16,
        md: 18,
        lg: 20,
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <MaterialIcon icon="progress_activity" size={iconSize[size]} className="animate-spin" />
            )}
            {!loading && icon && iconPosition === 'left' && (
                <MaterialIcon icon={icon} size={iconSize[size]} />
            )}
            <span className="truncate">{children}</span>
            {!loading && icon && iconPosition === 'right' && (
                <MaterialIcon icon={icon} size={iconSize[size]} />
            )}
        </button>
    );
}
