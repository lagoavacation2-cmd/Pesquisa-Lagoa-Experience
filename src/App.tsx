import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import PublicNpsForm from './components/PublicNpsForm';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import { isAuthenticated } from './lib/auth';

const LOGO_URL = "https://i.postimg.cc/1RjH4j0M/logo-lagoa.png";
const DECO_IMAGE = "https://i.postimg.cc/RF3bdCm2/Chat-GPT-Image-3-05-2026-12-23-43-(1).png";

export default function App() {
  const [isAdminAuth, setIsAdminAuth] = useState(isAuthenticated());

  // Simple layout wrapper for consistency
  const Layout = ({ children, hideDeco = false }: { children: React.ReactNode, hideDeco?: boolean }) => (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-lagoa-dark -z-10 rounded-b-[48px] sm:rounded-b-[80px] shadow-2xl" />
      <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-lagoa-light opacity-20 blur-[100px] rounded-full" />
      <div className="absolute top-[10%] right-[-50px] w-96 h-96 bg-lagoa-pool opacity-10 blur-[120px] rounded-full" />

      {/* Header */}
      <header className="pt-8 pb-6 px-4 flex flex-col items-center">
        <Link to="/">
          <img 
            src={LOGO_URL} 
            alt="Lagoa Experience Logo" 
            className="h-16 sm:h-20 drop-shadow-md mb-2"
          />
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 z-10">
        {!hideDeco && (
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-sky-400 blur-2xl opacity-20 rounded-full scale-110 group-hover:scale-125 transition-transform" />
              <img 
                src={DECO_IMAGE} 
                alt="Personagens Lagoa" 
                className="relative h-32 sm:h-48 drop-shadow-xl animate-float"
                style={{ filter: 'drop-shadow(0 15px 15px rgba(0,0,0,0.1))' }}
              />
            </div>
          </div>
        )}
        {children}
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 text-center">
        <p className="text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} Grupo Lagoa Quente • Todos os direitos reservados
        </p>
        <div className="mt-2 flex justify-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          <Link to="/" className="hover:text-sky-600 transition-colors">Pesquisa</Link>
          <span>•</span>
          <Link to="/admin" className="hover:text-sky-600 transition-colors">Administração</Link>
        </div>
      </footer>

      {/* Floating Action Hint for Admin on Mobile (Optional) */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={
          <Layout>
            <PublicNpsForm />
          </Layout>
        } />

        {/* Admin Route */}
        <Route path="/admin" element={
          isAdminAuth ? (
            <Layout hideDeco>
              <AdminDashboard />
            </Layout>
          ) : (
            <Layout hideDeco>
              <AdminLogin onLoginSuccess={() => setIsAdminAuth(true)} />
            </Layout>
          )
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
