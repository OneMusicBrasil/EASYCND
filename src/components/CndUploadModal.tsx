'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, UploadCloud, Calendar, FileText, AlertCircle, Loader2 } from 'lucide-react';
import styles from '@/app/dashboard.module.css';

interface CndUploadModalProps {
  isOpen: boolean;
  certificateId: string | null;
  onClose: () => void;
}

export const CndUploadModal: React.FC<CndUploadModalProps> = ({
  isOpen,
  certificateId,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { activeCompany, uploadCertificate, addToast } = useApp();
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Sync native dialog open state
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
      resetForm();
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

  const resetForm = () => {
    setIssueDate('');
    setExpiryDate('');
    setFile(null);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Auto-fill expiry date (180 days after issue date by default)
  const handleIssueDateChange = (val: string) => {
    setIssueDate(val);
    if (val) {
      const issue = new Date(val + 'T00:00:00');
      
      // Default validity based on typical rules:
      // FGTS is usually 30 days, others are usually 180 days.
      const daysToAdd = certificateId === 'fgts' ? 30 : 180;
      issue.setDate(issue.getDate() + daysToAdd);
      
      const yyyy = issue.getFullYear();
      const mm = String(issue.getMonth() + 1).padStart(2, '0');
      const dd = String(issue.getDate()).padStart(2, '0');
      setExpiryDate(`${yyyy}-${mm}-${dd}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== 'application/pdf') {
        addToast('Apenas arquivos PDF são permitidos.', 'error');
        return;
      }
      setFile(selected);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      if (dropped.type !== 'application/pdf') {
        addToast('Apenas arquivos PDF são permitidos.', 'error');
        return;
      }
      setFile(dropped);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId || !activeCompany) return;
    if (!file) {
      addToast('Por favor, selecione um arquivo PDF.', 'warning');
      return;
    }
    if (!issueDate || !expiryDate) {
      addToast('Por favor, preencha as datas de emissão e validade.', 'warning');
      return;
    }

    setUploading(true);
    try {
      // 1. Get presigned upload URL from Next.js API
      const signRes = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          companyId: activeCompany.id,
          certificateId: certificateId,
        }),
      });

      if (!signRes.ok) {
        throw new Error('Falha ao gerar URL de upload.');
      }

      const { uploadUrl, fileUrl, isMock } = await signRes.json();

      // 2. Upload file directly to R2 (or fallback mock PUT route)
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error('Falha ao enviar arquivo para o armazenamento.');
      }

      // 3. Save metadata to Supabase Database
      const success = await uploadCertificate(certificateId, fileUrl, issueDate, expiryDate);

      if (success) {
        if (isMock) {
          addToast('Nota: Carregado em modo de simulação (sem chaves R2).', 'info');
        }
        onClose();
      }
    } catch (err: any) {
      console.error('Upload flow error:', err);
      addToast(err.message || 'Erro durante o upload.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <dialog ref={dialogRef} style={{ maxWidth: '480px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Enviar Certidão</h2>
        <button 
          onClick={onClose} 
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          disabled={uploading}
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Dropzone */}
        <div 
          className={styles.dropzone}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={uploading}
          />
          {file ? (
            <div className={styles.fileBadge}>
              <FileText size={16} />
              <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <UploadCloud size={32} style={{ color: 'var(--text-secondary)' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Arraste o PDF ou clique para selecionar</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Apenas arquivos .pdf</span>
            </div>
          )}
        </div>

        {/* Issue Date */}
        <div className="form-group">
          <label className="form-label" htmlFor="issue-date">Data de Emissão</label>
          <div style={{ position: 'relative' }}>
            <Calendar 
              size={16} 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
            />
            <input
              id="issue-date"
              type="date"
              className="form-control"
              value={issueDate}
              onChange={(e) => handleIssueDateChange(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: '100%' }}
              required
              disabled={uploading}
            />
          </div>
        </div>

        {/* Expiry Date */}
        <div className="form-group">
          <label className="form-label" htmlFor="expiry-date">Data de Validade</label>
          <div style={{ position: 'relative' }}>
            <Calendar 
              size={16} 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
            />
            <input
              id="expiry-date"
              type="date"
              className="form-control"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: '100%' }}
              required
              disabled={uploading}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose} 
            style={{ flex: 1 }}
            disabled={uploading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ flex: 2, gap: '0.5rem' }}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="pulse" size={16} />
                <span>Enviando...</span>
              </>
            ) : (
              'Salvar Certidão'
            )}
          </button>
        </div>
      </form>
    </dialog>
  );
};
