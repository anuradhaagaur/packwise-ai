import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { AuthModal } from '../components/layout/AuthModal';

export interface MainLayoutProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
  onRunDemo: () => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  currentPage,
  onNavigate,
  onRunDemo,
  children,
}) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Header
        currentPage={currentPage}
        onNavigate={onNavigate}
        onOpenAuth={() => setAuthModalOpen(true)}
        onRunDemo={onRunDemo}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {children}
      </main>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};
