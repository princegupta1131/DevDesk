import React from 'react';
import { Logo } from './Logo';

interface AppLoaderProps {
    label?: string;
    size?: 'sm' | 'md';
    showBrandText?: boolean;
    className?: string;
}

const AppLoader: React.FC<AppLoaderProps> = ({
    label = 'Loading...',
    size = 'sm',
    showBrandText = false,
    className = '',
}) => {
    const logoClass =
        size === 'sm'
            ? 'w-8 h-8 rounded-xl shadow-lg shadow-indigo-500/20'
            : 'w-10 h-10 sm:w-11 sm:h-11 rounded-xl shadow-xl shadow-indigo-500/20';

    const contentGap = size === 'sm' ? 'gap-3' : 'gap-4';
    const wrapperPadding = size === 'sm' ? 'px-3.5 py-2.5' : 'px-5 py-4';

    return (
        <div className={`inline-flex items-center ${contentGap} ${wrapperPadding} rounded-2xl border border-slate-200/80 bg-white/92 backdrop-blur-sm shadow-[0_10px_30px_rgba(15,23,42,0.12)] ${className}`}>
            <Logo className={logoClass} showText={showBrandText} animated={false} />
            <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.1s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</span>
        </div>
    );
};

export default AppLoader;
