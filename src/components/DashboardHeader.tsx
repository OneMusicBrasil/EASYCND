'use client';

import React from 'react';
import { useApp, Company } from '@/context/AppContext';
import { Plus, Edit, LogOut, Building, ShieldAlert } from 'lucide-react';
import styles from '@/app/dashboard.module.css';

interface DashboardHeaderProps {
  onNewCompanyClick: () => void;
  onEditCompanyClick: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onNewCompanyClick,
  onEditCompanyClick,
}) => {
  const { user, companies, activeCompany, setActiveCompany, signOut } = useApp();

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = companies.find((c) => c.id === e.target.value);
    setActiveCompany(selected || null);
  };

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <ShieldAlert size={24} style={{ color: 'var(--accent-cyan)' }} />
        <span className={styles.brandLogo}>EASY CND</span>
      </div>

      <div className={styles.headerActions}>
        {user && (
          <div className={styles.companySelector}>
            <Building size={16} style={{ color: 'var(--text-secondary)' }} />
            <select
              className={styles.select}
              value={activeCompany?.id || ''}
              onChange={handleCompanyChange}
            >
              {companies.length === 0 ? (
                <option value="">Nenhuma Empresa Cadastrada</option>
              ) : (
                companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')})
                  </option>
                ))
              )}
            </select>

            {activeCompany ? (
              <button
                className="btn btn-secondary btn-icon"
                onClick={onEditCompanyClick}
                title="Editar dados da empresa"
              >
                <Edit size={16} />
              </button>
            ) : null}

            <button
              className="btn btn-primary"
              onClick={onNewCompanyClick}
              style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
            >
              <Plus size={16} />
              Nova Empresa
            </button>
          </div>
        )}

        {user && (
          <div className={styles.profileMenu}>
            <span className={styles.userEmail}>{user.email}</span>
            <button
              className="btn btn-secondary btn-icon"
              onClick={signOut}
              title="Sair"
              style={{ color: 'var(--color-expired)' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
