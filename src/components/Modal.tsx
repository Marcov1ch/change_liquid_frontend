import { type ReactNode, useEffect } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: Props) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40
                       animate-[fadeIn_150ms_ease-out]"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="bg-md-surface rounded-md-lg shadow-md-3 w-[90%] max-w-lg
                           max-h-[85vh] overflow-y-auto
                           animate-[scaleIn_150ms_ease-out]"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                <div className="sticky top-0 bg-md-surface z-10 px-6 pt-5 pb-2
                               border-b border-md-outline-variant">
                    <h2 className="text-headline-small m-0">{title}</h2>
                </div>
                <div className="px-6 py-4">{children}</div>
            </div>
        </div>
    );
}
