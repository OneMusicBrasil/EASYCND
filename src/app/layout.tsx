import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { ToastContainer } from '@/components/ToastContainer';

export const metadata: Metadata = {
  title: 'EASY CND - Emissão e Controle de Certidões Negativas',
  description: 'A plataforma inteligente para monitoramento, emissão e controle de validade de CNDs para licitações. Nunca mais perca um prazo de certidão pública.',
  robots: 'index, follow',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <AppProvider>
          {children}
          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  );
}
