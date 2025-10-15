import { useEffect, useRef } from 'react';
import './ConfirmModal.css';

type ConfirmModalProps = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export default function ConfirmModal({
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isOpen,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCancel();
      }

      // rudimentary focus trap for two buttons
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>('button');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey) {
          if (active === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    const t = setTimeout(() => firstBtnRef.current?.focus(), 0);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      clearTimeout(t);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="modal">
        <h3 id="confirm-title" className="heading-tertiary modal__title">{title}</h3>
        <p className="modal__message">{message}</p>
        <div className="modal__actions">
          <button ref={firstBtnRef} className="btn btn--small" onClick={onCancel}>{cancelText}</button>
          <button className="btn btn--small btn--red" onClick={() => void onConfirm()}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
