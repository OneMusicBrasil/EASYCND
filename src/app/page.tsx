'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { CndCard } from '@/components/CndCard';
import { CndUploadModal } from '@/components/CndUploadModal';
import { CndHistoryModal } from '@/components/CndHistoryModal';
import { CompanyModal } from '@/components/CompanyModal';
import { 
  Building2, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  Plus, 
  Search, 
  Filter, 
  Loader2, 
  Briefcase 
} from 'lucide-react';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const { 
    user, 
    loading, 
    activeCompany, 
    certificatesStatus,
    refreshData 
  } = useApp();

  // Modals visibility states
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [companyModalMode, setCompanyModalMode] = useState<'create' | 'edit'>('create');
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedCertIdForUpload, setSelectedCertIdForUpload] = useState<string | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedCertIdForHistory, setSelectedCertIdForHistory] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'expiring' | 'expired' | 'missing'>('all');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'federal' | 'state' | 'municipal'>('all');

  // Session check redirection
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Periodic check reminder (e.g. refresh every 5 mins when active)
  useEffect(() => {
    if (user && activeCompany) {
      const interval = setInterval(() => {
        refreshData();
      }, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user, activeCompany, refreshData]);

  // Open Handlers
  const handleOpenNewCompany = () => {
    setCompanyModalMode('create');
    setIsCompanyModalOpen(true);
  };

  const handleOpenEditCompany = () => {
    setCompanyModalMode('edit');
    setIsCompanyModalOpen(true);
  };

  const handleOpenUpload = (certId: string) => {
    setSelectedCertIdForUpload(certId);
    setIsUploadModalOpen(true);
  };

  const handleOpenHistory = (certId: string) => {
    setSelectedCertIdForHistory(certId);
    setIsHistoryModalOpen(true);
  };

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', gap: '1rem' }}>
        <Loader2 className="pulse" size={40} style={{ color: 'var(--accent-cyan)' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Verificando sessão...</span>
      </div>
    );
  }

  // Calculate statistics
  const totalCerts = certificatesStatus.length;
  const validCerts = certificatesStatus.filter(c => c.status === 'valid').length;
  const expiringCerts = certificatesStatus.filter(c => c.status === 'expiring').length;
  const expiredCerts = certificatesStatus.filter(c => c.status === 'expired' || c.status === 'missing').length;

  // Filter lists
  const filteredCndList = certificatesStatus.filter(cert => {
    const matchesSearch = cert.template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cert.template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    const matchesScope = scopeFilter === 'all' || cert.template.scope === scopeFilter;

    return matchesSearch && matchesStatus && matchesScope;
  });

  return (
    <div className={styles.dashboardWrapper}>
      <DashboardHeader 
        onNewCompanyClick={handleOpenNewCompany}
        onEditCompanyClick={handleOpenEditCompany}
      />

      <main className={styles.content}>
        {!activeCompany ? (
          /* Empty State - No Company */
          <section className={styles.emptyState}>
            <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-lg)', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
              <Building2 size={32} />
            </div>
            <h1 className={styles.emptyTitle}>Bem-vindo ao EASY CND</h1>
            <p className={styles.emptyText}>
              Para começar a emitir e monitorar certidões negativas de débitos para suas licitações, cadastre sua primeira empresa informando a Razão Social e o CNPJ.
            </p>
            <button className="btn btn-primary" onClick={handleOpenNewCompany} style={{ padding: '0.75rem 1.5rem', gap: '0.5rem' }}>
              <Plus size={18} />
              Cadastrar Primeira Empresa
            </button>
          </section>
        ) : (
          /* Main Dashboard Content */
          <>
            {/* Page Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                Painel de Controle — {activeCompany.name}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Acompanhe o vencimento de todas as certidões necessárias para suas licitações e contratos.
              </p>
            </div>

            {/* Statistics Bar */}
            <section className={styles.statsBar} aria-label="Estatísticas Rápidas">
              <div className={styles.statCard}>
                <div className={styles.statIconWrapper}>
                  <Briefcase size={20} style={{ color: 'var(--accent-cyan)' }} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{totalCerts}</span>
                  <span className={styles.statLabel}>Certidões Monitoradas</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIconWrapper} style={{ borderLeft: '4px solid var(--color-valid)' }}>
                  <ShieldCheck size={20} style={{ color: 'var(--color-valid)' }} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue} style={{ color: 'var(--color-valid)' }}>{validCerts}</span>
                  <span className={styles.statLabel}>Em Validade</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIconWrapper} style={{ borderLeft: '4px solid var(--color-expiring)' }}>
                  <AlertTriangle size={20} style={{ color: 'var(--color-expiring)' }} className={expiringCerts > 0 ? "pulse" : ""} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue} style={{ color: 'var(--color-expiring)' }}>{expiringCerts}</span>
                  <span className={styles.statLabel}>Próximas ao Vencimento</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIconWrapper} style={{ borderLeft: '4px solid var(--color-expired)' }}>
                  <XCircle size={20} style={{ color: 'var(--color-expired)' }} className={expiredCerts > 0 ? "pulse" : ""} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue} style={{ color: 'var(--color-expired)' }}>{expiredCerts}</span>
                  <span className={styles.statLabel}>Vencidas ou Pendentes</span>
                </div>
              </div>
            </section>

            {/* Filters Bar */}
            <section className={styles.filtersBar} aria-label="Filtros e Busca">
              <div className={styles.filtersLeft}>
                <div className={styles.searchWrapper}>
                  <Search 
                    size={16} 
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Pesquisar certidão..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '2.5rem', width: '100%', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
                  />
                </div>

                <div className={styles.filterGroup}>
                  <span className={styles.filterLabel}>Status:</span>
                  <select
                    className={styles.select}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    style={{ minWidth: '130px', paddingTop: '0.4rem', paddingBottom: '0.4rem' }}
                  >
                    <option value="all">Todos</option>
                    <option value="valid">Em Validade</option>
                    <option value="expiring">Próx. Vencimento</option>
                    <option value="expired">Vencidas</option>
                    <option value="missing">Não Cadastradas</option>
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <span className={styles.filterLabel}>Escopo:</span>
                  <select
                    className={styles.select}
                    value={scopeFilter}
                    onChange={(e) => { setStatusFilter('all'); setScopeFilter(e.target.value as any); }}
                    style={{ minWidth: '130px', paddingTop: '0.4rem', paddingBottom: '0.4rem' }}
                  >
                    <option value="all">Todos</option>
                    <option value="federal">Federal</option>
                    <option value="state">Estadual</option>
                    <option value="municipal">Municipal</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Cards Grid */}
            <section className={styles.cardsGrid} aria-label="Lista de Certidões Negativas">
              {filteredCndList.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
                  Nenhuma certidão corresponde aos filtros selecionados.
                </div>
              ) : (
                filteredCndList.map((cert) => (
                  <CndCard 
                    key={cert.template.id}
                    statusInfo={cert}
                    onUploadClick={handleOpenUpload}
                    onHistoryClick={handleOpenHistory}
                  />
                ))
              )}
            </section>
          </>
        )}
      </main>

      {/* Modals Mounting */}
      <CompanyModal 
        isOpen={isCompanyModalOpen}
        mode={companyModalMode}
        onClose={() => setIsCompanyModalOpen(false)}
      />

      <CndUploadModal 
        isOpen={isUploadModalOpen}
        certificateId={selectedCertIdForUpload}
        onClose={() => { setIsUploadModalOpen(false); setSelectedCertIdForUpload(null); }}
      />

      <CndHistoryModal 
        isOpen={isHistoryModalOpen}
        certificateId={selectedCertIdForHistory}
        onClose={() => { setIsHistoryModalOpen(false); setSelectedCertIdForHistory(null); }}
      />
    </div>
  );
}
