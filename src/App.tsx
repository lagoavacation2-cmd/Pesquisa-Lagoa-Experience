import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#F1F7FA]">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-[400px] sm:h-[480px] water-gradient -z-10 rounded-b-[40px] sm:rounded-b-[100px] shadow-2xl" />
      <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-white/20 blur-[100px] rounded-full" />
      <div className="absolute top-[300px] right-[-100px] w-96 h-96 bg-lagoa-light opacity-30 blur-[120px] rounded-full" />

      {/* Header Section */}
      <header className="pt-8 sm:pt-12 pb-8 px-4 z-10 w-full max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8 lg:gap-12">
          
          {/* Logo & Text Column */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            {/* Logo in White Card */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 sm:p-5 rounded-[28px] shadow-2xl shadow-black/10 flex items-center justify-center transform hover:scale-105 transition-transform"
            >
              <Link to="/">
                <img 
                  src={LOGO_URL} 
                  alt="Lagoa Experience Logo" 
                  className="w-[150px] sm:w-[180px] md:w-[220px] h-auto object-contain"
                />
              </Link>
            </motion.div>

            {!hideDeco && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/85 backdrop-blur-md p-6 sm:p-8 rounded-[32px] shadow-xl border border-white/50 max-w-xl"
              >
                <div className="space-y-3">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#003B73] leading-none">
                    Pesquisa de Satisfação
                  </h1>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0077B6] leading-none mb-4">
                    Lagoa Experience
                  </h2>
                  <p className="text-[#2F4F60] text-sm sm:text-base font-semibold leading-relaxed">
                    Sua opinião é fundamental para continuarmos evoluindo e proporcionar a melhor experiência.
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Mascot Column */}
          {!hideDeco && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-sky-400 blur-[80px] opacity-20 rounded-full scale-110" />
              <img 
                src={DECO_IMAGE} 
                alt="Personagens Lagoa" 
                className="w-[240px] sm:w-[320px] md:w-[400px] h-auto drop-shadow-2xl animate-float relative"
                style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))' }}
              />
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 z-10 -mt-2">
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
