import React from 'react';

interface BrandLogoProps {
    className?: string;
    iconSize?: 'sm' | 'md' | 'lg';
    showSubtitle?: boolean;
    titleClassName?: string;
    subtitleClassName?: string;
}

const ICON_SIZE_MAP: Record<NonNullable<BrandLogoProps['iconSize']>, string> = {
    sm: 'w-10 h-10 rounded-xl text-xl',
    md: 'w-12 h-12 rounded-2xl text-2xl',
    lg: 'w-14 h-14 rounded-2xl text-2xl',
};

const BrandLogo: React.FC<BrandLogoProps> = ({
    className = '',
    iconSize = 'md',
    showSubtitle = true,
    titleClassName = '',
    subtitleClassName = '',
}) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div
                className={`${ICON_SIZE_MAP[iconSize]} flex items-center justify-center text-white font-bold shadow-[0_10px_22px_rgba(79,70,229,0.28)]`}
                style={{ background: 'linear-gradient(145deg, #6d5df6 0%, #3f36c4 100%)' }}
                aria-hidden="true"
            >
                D
            </div>
            <div className="flex flex-col leading-tight">
                <span className={`text-slate-900 font-bold tracking-tight text-4xl ${titleClassName}`}>
                    DevDesk
                </span>
                {showSubtitle && (
                    <span className={`text-slate-500 font-medium text-sm ${subtitleClassName}`}>
                        Developer Tools
                    </span>
                )}
            </div>
        </div>
    );
};

export default BrandLogo;
