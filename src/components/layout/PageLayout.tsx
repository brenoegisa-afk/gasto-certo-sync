import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from './Navbar';
import { Navigate } from 'react-router-dom';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showBackButton?: boolean;
}

export function PageLayout({ 
  children, 
  title, 
  description, 
  showBackButton = false 
}: PageLayoutProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <main className="container mx-auto p-4 lg:p-8">
        {title && (
          <div className="mb-8 space-y-2">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <button
                  onClick={() => window.history.back()}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  ←
                </button>
              )}
              <h1 className="text-3xl lg:text-4xl font-bold gradient-text">
                {title}
              </h1>
            </div>
            {description && (
              <p className="text-lg text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}