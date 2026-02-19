import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
    className?: string;
    showText?: boolean;
    animated?: boolean;
    variant?: 'svg' | '3d';
}

export const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10", showText = false, animated = false }) => {
    return (
        <div className="flex items-center gap-3">
            <motion.div
                className={`relative flex items-center justify-center ${className}`}
                initial={animated ? { rotate: 0 } : undefined}
                whileHover={animated ? { scale: 1.05 } : undefined}
                transition={{ duration: 0.3 }}
            >
                {/* Modern Container with New Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg shadow-indigo-500/25"></div>

                {/* Glassy Glow Overlay */}
                <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-[1px]"></div>

                {/* Prominent Code Symbol SVG */}
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="relative w-3/5 h-3/5 z-10 text-white drop-shadow-md"
                >
                    <path
                        d="M7 8L3 12L7 16"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M17 8L21 12L17 16"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M14 4L10 20"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-80"
                    />
                </svg>
            </motion.div>

            {showText && (
                <div className="flex flex-col">
                    <motion.div
                        className="font-bold text-xl sm:text-2xl tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900"
                        initial={animated ? { opacity: 0, x: -10 } : false}
                        animate={animated ? { opacity: 1, x: 0 } : undefined}
                        transition={animated ? { duration: 0.5 } : undefined}
                        style={{ textShadow: '0px 1px 1px rgba(126, 155, 108, 0.1)' }}
                    >
                        DevDesk
                    </motion.div>
                    <motion.p
                        className="text-[10px] sm:text-[11px] font-medium text-indigo-600/80 -mt-0.5"
                        initial={animated ? { opacity: 0 } : false}
                        animate={animated ? { opacity: 1 } : undefined}
                        transition={animated ? { delay: 0.2, duration: 0.5 } : undefined}
                    >
                        Diff Checker • Viewer • Converter
                    </motion.p>
                </div>
            )}
        </div>
    );
};
