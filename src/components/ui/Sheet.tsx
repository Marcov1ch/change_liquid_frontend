import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Sheet({ isOpen, onClose, title, children, footer }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/45 animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Диалог'}
        tabIndex={-1}
        className="w-full sm:max-w-lg max-h-[90dvh] flex flex-col bg-surface rounded-t-md3-xl sm:rounded-md3-xl shadow-md3-4 animate-slide-up outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 pt-2.5 pb-1">
          <div className="mx-auto h-1 w-9 rounded-full bg-outline-variant" />
        </div>
        {title && (
          <div className="shrink-0 flex items-center justify-between gap-3 px-5 pb-3">
            <h2 className="text-title-md text-surface-on m-0">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 rounded-md3-full text-surface-on-variant hover:bg-surface-variant"
              aria-label="Закрыть"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        <div className="overflow-y-auto overscroll-contain px-5 pb-4">{children}</div>
        {footer && <div className="shrink-0 px-5 pt-2 pb-4 border-t border-outline-variant">{footer}</div>}
      </div>
    </div>
  );
}
