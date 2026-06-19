'use client';

import React from 'react';
import { CertificateStatus } from '@/context/AppContext';
import { Download, ExternalLink, History, UploadCloud, Calendar, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import styles from '@/app/dashboard.module.css';

interface CndCardProps {
  statusInfo: CertificateStatus;
  onUploadClick: (certId: string) => void;
  onHistoryClick: (certId: string) => void;
}

export const CndCard: React.FC<CndCardProps> = ({
  statusInfo,
  onUploadClick,
  onHistoryClick,
}) => {
  const { template, currentCert, status, daysRemaining } = statusInfo;

  // Format dates for BR locale
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Helper for status wording
  const getStatusText = () => {
    switch (status) {
      case 'valid':
        return `Em Validade (${daysRemaining} dias)`;
      case 'expiring':
        return `Expirando em ${daysRemaining} dias`;
      case 'expired':
        return 'Vencida';
      default:
        return 'Não cadastrada';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'valid':
        return <ShieldCheck size={18} style={{ color: 'var(--color-valid)' }} />;
      case 'expiring':
        return <Shield size={18} style={{ color: 'var(--color-expiring)' }} className="pulse" />;
      case 'expired':
        return <ShieldAlert size={18} style={{ color: 'var(--color-expired)' }} className="pulse" />;
      default:
        return <ShieldAlert size={18} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  // Calculate validity bar percentage (assuming a typical 180-day lifespan)
  const validityPercentage = currentCert
    ? Math.max(0, Math.min(100, (daysRemaining / 180) * 100))
    : 0;

  return (
    <article className={styles.cndCard} data-status={status}>
      <div className={styles.cardHeader}>
        <span className={styles.scopeBadge}>{template.scope}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {getStatusIcon()}
          <span 
            className={styles.statusIndicator} 
            data-status={status} 
            title={getStatusText()}
          />
        </div>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{template.name}</h3>
        <p className={styles.cardDesc} title={template.description}>
          {template.description}
        </p>

        {currentCert ? (
          <>
            <div className={styles.dateInfo}>
              <div className={styles.dateBlock}>
                <span className={styles.dateLabel}>Emissão</span>
                <span className={styles.dateValue}>{formatDate(currentCert.issue_date)}</span>
              </div>
              <div className={styles.dateBlock}>
                <span className={styles.dateLabel}>Validade</span>
                <span 
                  className={styles.dateValue} 
                  style={{ color: status === 'expired' ? 'var(--color-expired)' : status === 'expiring' ? 'var(--color-expiring)' : 'inherit' }}
                >
                  {formatDate(currentCert.expiry_date)}
                </span>
              </div>
            </div>

            <div className={styles.timeMeter}>
              <div className={styles.meterTrack}>
                <div 
                  className={styles.meterFill} 
                  data-status={status} 
                  style={{ width: `${validityPercentage}%` }}
                />
              </div>
              <div className={styles.meterText}>
                <span>{getStatusText()}</span>
                <span>{validityPercentage.toFixed(0)}%</span>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.dateInfo} style={{ display: 'flex', justifyContent: 'center', padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Calendar size={14} /> Nenhum documento enviado
            </span>
          </div>
        )}
      </div>

      <div className={styles.cardFooter}>
        <a 
          href={template.defaultUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-secondary btn-icon"
          title="Ir para o portal de emissão oficial"
          style={{ flex: '0 0 auto' }}
        >
          <ExternalLink size={16} />
        </a>

        {currentCert && (
          <>
            <button
              onClick={() => onHistoryClick(template.id)}
              className="btn btn-secondary btn-icon"
              title="Histórico de Envios"
              style={{ flex: '0 0 auto' }}
            >
              <History size={16} />
            </button>

            <a
              href={currentCert.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary cardActionBtn"
              style={{ gap: '0.375rem' }}
            >
              <Download size={16} />
              Visualizar
            </a>
          </>
        )}

        <button
          onClick={() => onUploadClick(template.id)}
          className={`btn ${currentCert ? 'btn-secondary' : 'btn-primary'} cardActionBtn`}
          style={{ gap: '0.375rem' }}
        >
          <UploadCloud size={16} />
          {currentCert ? 'Atualizar' : 'Enviar PDF'}
        </button>
      </div>
    </article>
  );
};
