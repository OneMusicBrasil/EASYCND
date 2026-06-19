'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CERTIFICATE_TEMPLATES, CertificateTemplate } from '@/config/certificates';
import { User } from '@supabase/supabase-js';

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  state_inscription?: string | null;
  municipal_inscription?: string | null;
  state: string;
  city: string;
  user_id: string;
  created_at: string;
}

export interface CompanyCertificate {
  id: string;
  company_id: string;
  certificate_id: string;
  file_url: string;
  issue_date: string;
  expiry_date: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface CertificateStatus {
  template: CertificateTemplate;
  currentCert: CompanyCertificate | null;
  history: CompanyCertificate[];
  status: 'valid' | 'expiring' | 'expired' | 'missing';
  daysRemaining: number;
}

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  companies: Company[];
  activeCompany: Company | null;
  setActiveCompany: (company: Company | null) => void;
  certificatesStatus: CertificateStatus[];
  refreshData: () => Promise<void>;
  createCompany: (companyData: Omit<Company, 'id' | 'user_id' | 'created_at'>) => Promise<boolean>;
  updateCompany: (companyId: string, companyData: Partial<Company>) => Promise<boolean>;
  deleteCompany: (companyId: string) => Promise<boolean>;
  uploadCertificate: (certificateId: string, fileUrl: string, issueDate: string, expiryDate: string) => Promise<boolean>;
  deleteCertificate: (certId: string) => Promise<boolean>;
  toasts: ToastMessage[];
  addToast: (text: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompanyState] = useState<Company | null>(null);
  const [certificatesStatus, setCertificatesStatus] = useState<CertificateStatus[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Keep auto-removing toasts
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        removeToast(toasts[0].id);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        setCompanies([]);
        setActiveCompanyState(null);
        setCertificatesStatus([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Companies when user signs in
  useEffect(() => {
    if (user) {
      fetchCompanies();
    }
  }, [user]);

  // Fetch Certificates when active company changes
  useEffect(() => {
    if (activeCompany) {
      fetchCertificates(activeCompany.id);
    } else {
      setCertificatesStatus([]);
    }
  }, [activeCompany]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setCompanies(data || []);
      
      // Select first company or restore previous active company selection from localStorage
      if (data && data.length > 0) {
        const savedCompanyId = localStorage.getItem('active_company_id');
        const restored = data.find(c => c.id === savedCompanyId);
        setActiveCompanyState(restored || data[0]);
      } else {
        setActiveCompanyState(null);
      }
    } catch (err: any) {
      console.error('Error fetching companies:', err);
      addToast('Erro ao carregar empresas: ' + err.message, 'error');
    }
  };

  const setActiveCompany = (company: Company | null) => {
    setActiveCompanyState(company);
    if (company) {
      localStorage.setItem('active_company_id', company.id);
    } else {
      localStorage.removeItem('active_company_id');
    }
  };

  const fetchCertificates = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('company_certificates')
        .select('*')
        .eq('company_id', companyId)
        .order('issue_date', { ascending: false });

      if (error) throw error;

      const certs = (data || []) as CompanyCertificate[];

      // Calculate status for each pre-defined certificate type
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const statusList: CertificateStatus[] = CERTIFICATE_TEMPLATES.map(template => {
        // Filter history of uploads for this specific template type
        const history = certs.filter(c => c.certificate_id === template.id);
        const currentCert = history.length > 0 ? history[0] : null; // Most recent upload
        
        let status: 'valid' | 'expiring' | 'expired' | 'missing' = 'missing';
        let daysRemaining = 0;

        if (currentCert) {
          // Parse date
          const expDate = new Date(currentCert.expiry_date + 'T00:00:00');
          expDate.setHours(0, 0, 0, 0);
          
          const timeDiff = expDate.getTime() - today.getTime();
          daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

          if (daysRemaining < 0) {
            status = 'expired';
          } else if (daysRemaining <= 15) {
            status = 'expiring';
          } else {
            status = 'valid';
          }
        }

        return {
          template,
          currentCert,
          history,
          status,
          daysRemaining
        };
      });

      setCertificatesStatus(statusList);
    } catch (err: any) {
      console.error('Error fetching certificates:', err);
      addToast('Erro ao carregar certidões: ' + err.message, 'error');
    }
  };

  const refreshData = async () => {
    if (user) {
      await fetchCompanies();
      if (activeCompany) {
        await fetchCertificates(activeCompany.id);
      }
    }
  };

  const createCompany = async (companyData: Omit<Company, 'id' | 'user_id' | 'created_at'>) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('companies')
        .insert([{ ...companyData, user_id: user.id }])
        .select();

      if (error) throw error;

      addToast('Empresa criada com sucesso!', 'success');
      await fetchCompanies();
      if (data && data.length > 0) {
        setActiveCompany(data[0]);
      }
      return true;
    } catch (err: any) {
      console.error('Error creating company:', err);
      addToast('Erro ao criar empresa: ' + err.message, 'error');
      return false;
    }
  };

  const updateCompany = async (companyId: string, companyData: Partial<Company>) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update(companyData)
        .eq('id', companyId);

      if (error) throw error;

      addToast('Empresa atualizada com sucesso!', 'success');
      await fetchCompanies();
      return true;
    } catch (err: any) {
      console.error('Error updating company:', err);
      addToast('Erro ao atualizar empresa: ' + err.message, 'error');
      return false;
    }
  };

  const deleteCompany = async (companyId: string) => {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (error) throw error;

      addToast('Empresa excluída com sucesso!', 'success');
      await fetchCompanies();
      return true;
    } catch (err: any) {
      console.error('Error deleting company:', err);
      addToast('Erro ao excluir empresa: ' + err.message, 'error');
      return false;
    }
  };

  const uploadCertificate = async (certificateId: string, fileUrl: string, issueDate: string, expiryDate: string) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');
      if (!activeCompany) throw new Error('Nenhuma empresa selecionada');

      const { error } = await supabase
        .from('company_certificates')
        .insert([{
          company_id: activeCompany.id,
          certificate_id: certificateId,
          file_url: fileUrl,
          issue_date: issueDate,
          expiry_date: expiryDate,
          uploaded_by: user.id
        }]);

      if (error) throw error;

      addToast('Certidão enviada com sucesso!', 'success');
      await fetchCertificates(activeCompany.id);
      return true;
    } catch (err: any) {
      console.error('Error saving certificate metadata:', err);
      addToast('Erro ao salvar informações da certidão: ' + err.message, 'error');
      return false;
    }
  };

  const deleteCertificate = async (certId: string) => {
    try {
      if (!activeCompany) throw new Error('Nenhuma empresa selecionada');

      const { error } = await supabase
        .from('company_certificates')
        .delete()
        .eq('id', certId);

      if (error) throw error;

      addToast('Histórico de certidão excluído!', 'success');
      await fetchCertificates(activeCompany.id);
      return true;
    } catch (err: any) {
      console.error('Error deleting certificate:', err);
      addToast('Erro ao excluir certidão: ' + err.message, 'error');
      return false;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    addToast('Sessão encerrada com sucesso.', 'info');
  };

  return (
    <AppContext.Provider value={{
      user,
      loading,
      companies,
      activeCompany,
      setActiveCompany,
      certificatesStatus,
      refreshData,
      createCompany,
      updateCompany,
      deleteCompany,
      uploadCertificate,
      deleteCertificate,
      toasts,
      addToast,
      removeToast,
      signOut
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
