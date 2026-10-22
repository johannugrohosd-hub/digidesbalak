import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto no-print">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        {/* Modal Dialog */}
        <div className={`relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full ${maxWidthClasses} border border-slate-200`}>
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
              title="Tutup (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="max-h-[calc(85vh-80px)] overflow-y-auto p-6 text-slate-700">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
