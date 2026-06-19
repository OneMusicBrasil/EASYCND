'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useApp, Company } from '@/context/AppContext';
import { X, Building2, FileDigit, Landmark, MapPin, Loader2, Trash2 } from 'lucide-react';
import styles from '@/app/dashboard.module.css';

interface CompanyModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  onClose: () => void;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
  isOpen,
  mode,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { activeCompany, createCompany, updateCompany, deleteCompany, addToast } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [stateInscription, setStateInscription] = useState('');
  const [municipalInscription, setMunicipalInscription] = useState('');
  const [state, setState] = useState('SP');
  const [city, setCity] = useState('São Sebastião');

  // Load active company data if in edit mode
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && activeCompany) {
        setName(activeCompany.name);
        setCnpj(activeCompany.cnpj);
        setStateInscription(activeCompany.state_inscription || '');
        setMunicipalInscription(activeCompany.municipal_inscription || '');
        setState(activeCompany.state);
        setCity(activeCompany.city);
      } else {
        setName('');
        setCnpj('');
        setStateInscription('');
        setMunicipalInscription('');
        setState('SP');
        setCity('São Sebastião');
      }
    }
  }, [isOpen, mode, activeCompany]);

  // Sync native dialog
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

  const cleanCnpj = (val: string) => {
    return val.replace(/\D/g, '');
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format on the fly: 00.000.000/0000-00
    const rawVal = cleanCnpj(e.target.value).substring(0, 14);
    setCnpj(rawVal);
  };

  const formatCnpjDisplay = (val: string) => {
    let formatted = val;
    if (val.length > 2) formatted = val.replace(/^(\d{2})/, '$1.');
    if (val.length > 5) formatted = val.replace(/^(\d{2})\.(\d{3})/, '$1.$2.');
    if (val.length > 8) formatted = val.replace(/^(\d{2})\.(\d{3})\.(\d{3})/, '$1.$2.$3/');
    if (val.length > 12) formatted = val.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})/, '$1.$2.$3/$4-');
    return formatted;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cnpj) {
      addToast('Nome e CNPJ são obrigatórios.', 'warning');
      return;
    }

    if (cnpj.length !== 14) {
      addToast('CNPJ deve conter 14 dígitos numéricos.', 'error');
      return;
    }

    setSubmitting(true);
    
    const companyData = {
      name,
      cnpj,
      state_inscription: stateInscription || null,
      municipal_inscription: municipalInscription || null,
      state,
      city,
    };

    let success = false;
    if (mode === 'create') {
      success = await createCompany(companyData);
    } else if (mode === 'edit' && activeCompany) {
      success = await updateCompany(activeCompany.id, companyData);
    }

    setSubmitting(false);
    if (success) {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!activeCompany) return;
    if (!window.confirm(`Tem certeza de que deseja excluir a empresa "${activeCompany.name}" e todas as suas certidões associadas? Esta ação é irreversível.`)) {
      return;
    }

    setDeleting(true);
    const success = await deleteCompany(activeCompany.id);
    setDeleting(false);
    
    if (success) {
      onClose();
    }
  };

  return (
    <dialog ref={dialogRef} style={{ maxWidth: '500px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
          {mode === 'create' ? 'Cadastrar Nova Empresa' : 'Editar Dados da Empresa'}
        </h2>
        <button 
          onClick={onClose} 
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          disabled={submitting || deleting}
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="company-name">Razão Social / Nome da Empresa</label>
          <div style={{ position: 'relative' }}>
            <Building2 
              size={16} 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
            />
            <input
              id="company-name"
              type="text"
              className="form-control"
              placeholder="Minha Empresa LTDA"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: '100%' }}
              required
              disabled={submitting || deleting}
            />
          </div>
        </div>

        {/* CNPJ */}
        <div className="form-group">
          <label className="form-label" htmlFor="company-cnpj">CNPJ</label>
          <div style={{ position: 'relative' }}>
            <FileDigit 
              size={16} 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
            />
            <input
              id="company-cnpj"
              type="text"
              className="form-control"
              placeholder="00.000.000/0000-00"
              value={formatCnpjDisplay(cnpj)}
              onChange={handleCnpjChange}
              style={{ paddingLeft: '2.5rem', width: '100%' }}
              required
              disabled={submitting || deleting}
            />
          </div>
        </div>

        {/* State Inscription & Municipal Inscription */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="state-inscription">Inscrição Estadual (Opcional)</label>
            <div style={{ position: 'relative' }}>
              <Landmark 
                size={16} 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
              />
              <input
                id="state-inscription"
                type="text"
                className="form-control"
                placeholder="123456789.12-3"
                value={stateInscription}
                onChange={(e) => setStateInscription(e.target.value)}
                style={{ paddingLeft: '2.5rem', width: '100%' }}
                disabled={submitting || deleting}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="municipal-inscription">Inscrição Municipal (Opcional)</label>
            <div style={{ position: 'relative' }}>
              <Landmark 
                size={16} 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
              />
              <input
                id="municipal-inscription"
                type="text"
                className="form-control"
                placeholder="123456-7"
                value={municipalInscription}
                onChange={(e) => setMunicipalInscription(e.target.value)}
                style={{ paddingLeft: '2.5rem', width: '100%' }}
                disabled={submitting || deleting}
              />
            </div>
          </div>
        </div>

        {/* State & City */}
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="company-state">UF</label>
            <input
              id="company-state"
              type="text"
              className="form-control"
              placeholder="SP"
              maxLength={2}
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase())}
              style={{ textTransform: 'uppercase', textAlign: 'center' }}
              required
              disabled={submitting || deleting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="company-city">Cidade Sede</label>
            <div style={{ position: 'relative' }}>
              <MapPin 
                size={16} 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
              />
              <input
                id="company-city"
                type="text"
                className="form-control"
                placeholder="São Sebastião"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ paddingLeft: '2.5rem', width: '100%' }}
                required
                disabled={submitting || deleting}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', alignItems: 'center' }}>
          {mode === 'edit' && (
            <button
              type="button"
              className="btn btn-danger btn-icon"
              onClick={handleDelete}
              title="Excluir Empresa"
              disabled={submitting || deleting}
              style={{ padding: '0.75rem' }}
            >
              {deleting ? <Loader2 className="pulse" size={16} /> : <Trash2 size={16} />}
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ flex: 1 }}
            disabled={submitting || deleting}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: 2 }}
            disabled={submitting || deleting}
          >
            {submitting ? (
              <Loader2 className="pulse" size={16} />
            ) : (
              mode === 'create' ? 'Cadastrar Empresa' : 'Salvar Alterações'
            )}
          </button>
        </div>
      </form>
    </dialog>
  );
};
