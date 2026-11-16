import { useId, useState, type ReactNode } from 'react';

interface Props {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
    summary?: string;
}

export function Spoiler({ title, children, defaultOpen = false, summary }: Props) {
    const [open, setOpen] = useState(defaultOpen);
    const contentId = useId();

    return (
        <div className="border-b border-outline-variant">
            <button
                type="button"
                onClick={() => setOpen(prev => !prev)}
                aria-expanded={open}
                aria-controls={contentId}
                className="flex items-center justify-between w-full py-3 text-title-sm text-surface-on cursor-pointer bg-transparent border-none text-left"
            >
                <span className="flex flex-col items-start gap-0.5">
                    <span>{title}</span>
                    {summary && (
                        <span className="text-body-sm text-outline font-normal">{summary}</span>
                    )}
                </span>
                <svg
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            <div
                id={contentId}
                role="region"
                aria-label={title}
                inert={!open}
                className={`overflow-hidden transition-all duration-200 ${
                    open ? 'max-h-[5000px] opacity-100 pb-4' : 'max-h-0 opacity-0'
                }`}
            >
                {children}
            </div>
        </div>
    );
}
