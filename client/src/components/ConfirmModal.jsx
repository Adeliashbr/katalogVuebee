import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, Info } from 'lucide-react';

export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Ya, Hapus', variant = 'danger' }) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('modal-open-locked');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open-locked');
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isInfo = variant === 'info';
  const confirmClass = isInfo ? 'btn btn-primary' : 'btn btn-danger';

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }} role="dialog" aria-modal="true">
        <div className="modal-body">
          <div className={`confirm-icon-box${isInfo ? ' warn' : ''}`}>
            {isInfo ? <Info size={30} /> : <AlertTriangle size={30} />}
          </div>

          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', marginTop: '1rem', color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>
            {title}
          </h3>

          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {message}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={onCancel} style={{ flex: 1 }}>
              Batal
            </button>
            <button className={confirmClass} onClick={onConfirm} style={{ flex: 1 }}>
              {!isInfo && <Trash2 size={16} />}
              <span>{confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
