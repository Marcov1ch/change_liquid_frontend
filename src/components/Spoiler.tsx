import { useState, type ReactNode } from 'react';

interface Props {
    title: string;
    children: ReactNode;
}

export function Spoiler({ title, children }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border-b border-outline-variant">
            <button
                type="button"
                onClick={() => setOpen(prev => !prev)}
                className="flex items-center justify-between w-full py-3 text-title-sm text-surface-on cursor-pointer bg-transparent border-none"
            >
                {title}
                <svg
                    className={`w-5 h-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            <div className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-[2000px] opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
                {children}
            </div>
        </div>
    );
}
