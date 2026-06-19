'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import styles from './login.module.css';
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, addToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Por favor, preencha todos os campos.', 'warning');
      return;
    }

    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      addToast('Bem-vindo de volta!', 'success');
      router.push('/');
    } catch (err: any) {
      console.error('Login error:', err);
      addToast(err.message || 'Erro ao realizar login.', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading || user) {
    return (
      <div className={styles.loginWrapper}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Loader2 className="pulse" size={40} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Carregando sessão...</span>
        </div>
      </div>
    );
  }

  return (
    <main className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logo}>EASY CND</div>
          <h1 className={styles.title}>Acessar Plataforma</h1>
          <p className={styles.subtitle}>Emissão e controle de certidões negativas</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">E-mail</label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-muted)' 
                }} 
              />
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="nome@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem', width: '100%' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-muted)' 
                }} 
              />
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="Sua senha secreta"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem', width: '100%' }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={authLoading}
            style={{ width: '100%', marginTop: '0.5rem', gap: '0.75rem' }}
          >
            {authLoading ? (
              <Loader2 className="pulse" size={18} />
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className={styles.divider}>ou</div>

        <div className={styles.footer}>
          Não tem uma conta? <Link href="/register">Cadastre-se</Link>
        </div>
      </div>
    </main>
  );
}
