import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, ArrowUpRight, ArrowDownLeft, Users, FileBarChart, Settings, Plus, LogOut, Moon, Sun, Languages, Bell, X } from 'lucide-react';
import { useApp } from './AppContext';
import { logout, signIn } from './lib/firebase';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Ledger from './components/Ledger';
import Reports from './components/Reports';
import Account from './components/Account';

export default function App() {
  const { user, loading, t, language, setLanguage, theme, setTheme, showReminder, dismissReminder } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'ledger' | 'reports' | 'account'>('dashboard');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl text-center space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Lenden</h1>
            <p className="text-gray-500 dark:text-gray-400">{t('signInWithGoogle')}</p>
          </div>
          <button 
            onClick={signIn}
            className="w-full flex items-center justify-center gap-3 bg-primary text-white py-4 px-6 rounded-2xl font-semibold hover:bg-primary-dark transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale invert" alt="" />
            {t('signInWithGoogle')}
          </button>
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'transactions': return <Transactions />;
      case 'ledger': return <Ledger />;
      case 'reports': return <Reports />;
      case 'account': return <Account />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Lenden</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            <Languages size={20} />
          </button>
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Reminder Popup */}
      <AnimatePresence>
        {showReminder && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 left-4 right-4 z-50 md:left-auto md:right-8 md:bottom-8 md:max-w-sm"
          >
            <div className="bg-primary text-white p-5 rounded-3xl shadow-2xl flex items-start gap-4 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12"></div>
               <div className="bg-white/20 p-3 rounded-2xl">
                  <Bell size={24} className="animate-bounce" />
               </div>
               <div className="flex-1">
                  <h4 className="font-bold text-lg">{t('reminderTitle')}</h4>
                  <p className="text-white/80 text-sm">{t('reminderMsg')}</p>
                  <div className="mt-4 flex gap-2">
                     <button 
                      onClick={() => { setActiveTab('transactions'); dismissReminder(); }}
                      className="bg-white text-primary px-4 py-2 rounded-xl font-bold text-sm"
                     >
                        {t('addTransaction')}
                     </button>
                     <button 
                      onClick={dismissReminder}
                      className="bg-white/10 text-white px-4 py-2 rounded-xl font-bold text-sm"
                     >
                        {t('cancel')}
                     </button>
                  </div>
               </div>
               <button onClick={dismissReminder} className="text-white/50 hover:text-white">
                  <X size={20} />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 h-20 md:h-16 flex items-center justify-between max-w-lg mx-auto md:rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={22} />} label={t('dashboard')} />
        <NavButton active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} icon={<ArrowUpRight size={22} />} label={t('income') + '/' + t('expense')} />
        <div className="relative -top-6 pb-2">
           <button 
            onClick={() => setActiveTab('transactions')}
            className="bg-primary text-white p-4 rounded-2xl shadow-xl shadow-primary/40 active:scale-90 transition-transform"
           >
              <Plus size={24} />
           </button>
        </div>
        <NavButton active={activeTab === 'ledger'} onClick={() => setActiveTab('ledger')} icon={<Users size={22} />} label={t('ledger')} />
        <NavButton active={activeTab === 'account'} onClick={() => setActiveTab('account')} icon={<Settings size={22} />} label={t('settings')} />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
        active ? 'text-primary scale-110' : 'text-gray-400 dark:text-gray-500'
      }`}
    >
      {icon}
      <span className={`text-[10px] mt-1 font-medium ${active ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>{label}</span>
    </button>
  );
}
