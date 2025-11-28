import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    variant?: 'default' | 'stats' | 'catalog';
    className?: string;
    onClick?: () => void;
    hover?: boolean;
}

export function Card({
    children,
    variant = 'default',
    className = '',
    onClick,
    hover = false,
}: CardProps) {
    const baseStyles = 'rounded-xl border transition-all';

    const variantStyles = {
        default: 'bg-bronze-canvas-component-bg border-bronze-canvas-border p-6',
        stats: 'bg-bronze-canvas-component-bg border-bronze-canvas-border p-6',
        catalog: 'bg-bronze-canvas-component-bg border-bronze-canvas-border overflow-hidden',
    };

    const hoverStyles = hover || onClick ? 'hover:border-bronze-canvas-accent hover:shadow-sm cursor-pointer' : '';
    const clickableStyles = onClick ? 'active:scale-[0.98]' : '';

    return (
        <div
            className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${clickableStyles} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

interface StatsCardProps {
    label: string;
    value: number | string;
    className?: string;
}

export function StatsCard({ label, value, className = '' }: StatsCardProps) {
    return (
        <Card variant="stats" className={className}>
            <p className="text-bronze-canvas-secondary-text text-base font-medium leading-normal mb-2">
                {label}
            </p>
            <p className="text-bronze-canvas-primary-text text-3xl font-bold leading-tight">
                {value}
            </p>
        </Card>
    );
}
