interface MaterialIconProps {
    icon: string;
    className?: string;
    size?: number;
    filled?: boolean;
    weight?: number;
}

export function MaterialIcon({
    icon,
    className = '',
    size,
    filled = false,
    weight = 400
}: MaterialIconProps) {
    const style: React.CSSProperties = {
        fontSize: size ? `${size}px` : undefined,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
    };

    return (
        <span
            className={`material-symbols-outlined ${className}`}
            style={style}
        >
            {icon}
        </span>
    );
}

// Icon name mappings from Lucide to Material Symbols
export const iconMap = {
    // Navigation & UI
    menu: 'menu',
    close: 'close',
    settings: 'settings',
    arrowBack: 'arrow_back',
    arrowForward: 'arrow_forward',
    moreVert: 'more_vert',
    moreHoriz: 'more_horiz',

    // Actions
    add: 'add',
    remove: 'remove',
    edit: 'edit',
    delete: 'delete',
    save: 'save',
    cancel: 'cancel',
    check: 'check',

    // Files & Media
    upload: 'upload_file',
    download: 'download',
    image: 'image',
    folder: 'folder',
    photoLibrary: 'photo_library',

    // Social & Sharing
    share: 'share',

    // Content
    layers: 'layers',
    autoAwesome: 'auto_awesome',
    lightbulb: 'lightbulb',

    // Status & Feedback
    visibility: 'visibility',
    visibilityOff: 'visibility_off',
    info: 'info',
    warning: 'warning',
    error: 'error',
    success: 'check_circle',

    // Loading
    progressActivity: 'progress_activity',

    // Catalog specific
    autoStories: 'auto_stories',
} as const;

export type IconName = keyof typeof iconMap;
