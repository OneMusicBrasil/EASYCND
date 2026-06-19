'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useApp, CertificateStatus } from '@/context/AppContext';
import { X, Trash2, Download, Calendar, Loader2 } from 'lucide-react';
import styles from '@/app/dashboard.module.css';

interface CndHistoryModalProps {
  isOpen: boolean;
  certificateId: string | null;
  onClose: () => void;
}

export const CndHistoryModal: React.FC<CndHistoryModalProps> = ({
  isOpen,
  certificateId,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { certificatesStatus, deleteCertificate, addToast } = useApp();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const statusInfo = certificatesStatus.find(c => c.template.id === certificateId);

  // Sync native dialog state
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Fallback for light-dismiss (clicking on the backdrop)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === dialog) {
        const rect = dialog.getBoundingClientRect();
        const isInDialog = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isInDialog) {
          onClose();
        }
      }
    };

    dialog.addEventListener('click', handleBackdropClick);
    return () => dialog.removeEventListener('click', handleBackdropClick);
  }, [onClose]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza de que deseja remover esta certidão do histórico?')) {
      return;
    }
    setDeletingId(id);
    const success = await deleteCertificate(id);
    setDeletingId(null);
    
    // Close the history modal if the list becomes empty
    if (success && statusInfo && statusInfo.history.length <= 1) {
      onClose();
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  if (!statusInfo) return null;

  return (
    <dialog ref={dialogRef} style={{ maxWidth: '520px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Histórico de Envios</h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {statusInfo.template.name}
          </span>
        </div>
        <button 
          onClick={onClose} 
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>
      </div>

      <div className={styles.historyList}>
        {statusInfo.history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            Nenhuma certidão enviada no histórico.
          </div>
        ) : (
          statusInfo.history.map((cert) => (
            <div key={cert.id} className={styles.historyItem}>
              <div className={styles.historyDetails}>
                <span className={styles.historyDate}>
                  Validade: {formatDate(cert.expiry_date)}
                </span>
                <span className={styles.historyMeta}>
                  Emissão: {formatDate(cert.issue_date)} • Enviado em: {formatDate(cert.uploaded_at.split('T')[0])}
                </span>
              </div>
              
              <div className={styles.historyActions}>
                <a
                  href={cert.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-icon"
                  title="Download / Visualizar PDF"
                >
                  <Download size={14} />
                </a>
                
                <button
                  onClick={() => handleDelete(cert.id)}
                  className="btn btn-danger btn-icon"
                  title="Excluir do histórico"
                  disabled={deletingId === cert.id}
                >
                  {deletingId === cert.id ? (
                    <Loader2 size={14} className="pulse" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <button className="btn btn-secondary" onClick={onClose}>
          Fechar
        </button>
      </div>
    </dialog>
  );
};
