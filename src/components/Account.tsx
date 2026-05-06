import React from 'react';
import { useApp } from '../AppContext';
import { logout } from '../lib/firebase';
import { User, Mail, Globe, Moon, LogOut, ChevronRight, Bell, Clock, Volume2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Account() {
  const { profile, user, t, language, setLanguage, theme, setTheme, updateSettings } = useApp();

  const toggleReminders = () => {
    if (profile) {
      updateSettings({
        reminders: {
          ...profile.settings.reminders,
          enabled: !profile.settings.reminders.enabled
        }
      });
    }
  };

  const updateReminderTime = (time: string) => {
    if (profile) {
      updateSettings({
        reminders: {
          ...profile.settings.reminders,
          time
        }
      });
    }
  };

  const toggleSound = () => {
    if (profile) {
      updateSettings({
        reminders: {
          ...profile.settings.reminders,
          sound: !profile.settings.reminders.sound
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] text-center border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-primary">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-full h-full rounded-[2.5rem] object-cover" />
          ) : (
            <User size={40} />
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold dark:text-white">{profile?.name || user?.displayName}</h2>
          <p className="text-gray-500 text-sm flex items-center justify-center gap-1"><Mail size={14} /> {user?.email}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">{t('reminders')}</h3>
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-50 dark:border-gray-800">
               <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                    <Bell size={20} />
                  </div>
                  <span className="font-bold dark:text-white">{t('enableReminder')}</span>
               </div>
               <button 
                onClick={toggleReminders}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  profile?.settings.reminders.enabled ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                )}
               >
                 <div className={cn(
                   "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                   profile?.settings.reminders.enabled ? "translate-x-6" : ""
                 )} />
               </button>
            </div>
            {profile?.settings.reminders.enabled && (
              <>
                <div className="flex items-center justify-between p-5 border-b border-gray-50 dark:border-gray-800">
                   <div className="flex items-center gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl text-gray-400">
                        <Clock size={20} />
                      </div>
                      <span className="font-bold dark:text-white">{t('reminderTime')}</span>
                   </div>
                   <input 
                    type="time" 
                    value={profile.settings.reminders.time}
                    onChange={(e) => updateReminderTime(e.target.value)}
                    className="bg-transparent font-bold text-primary border-none p-0 focus:ring-0"
                   />
                </div>
                <div className="flex items-center justify-between p-5 border-b border-gray-50 dark:border-gray-800">
                   <div className="flex items-center gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl text-gray-400">
                        <Volume2 size={20} />
                      </div>
                      <span className="font-bold dark:text-white">{t('soundAlert')}</span>
                   </div>
                   <button 
                    onClick={toggleSound}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      profile?.settings.reminders.sound ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                    )}
                   >
                     <div className={cn(
                       "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                       profile?.settings.reminders.sound ? "translate-x-6" : ""
                     )} />
                   </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">{t('settings')}</h3>
          
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            <SettingsItem 
              icon={<Globe size={20} />} 
              label={t('language')} 
              value={language === 'en' ? 'English' : 'বাংলা'} 
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            />
            <SettingsItem 
              icon={<Moon size={20} />} 
              label={t('darkMode')} 
              value={theme === 'dark' ? 'ON' : 'OFF'} 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
           <button 
            onClick={logout}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-red-500"
          >
            <div className="flex items-center gap-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-2xl">
                <LogOut size={20} />
              </div>
              <span className="font-bold">{t('signOut')}</span>
            </div>
          </button>
        </div>
      </div>

      <div className="text-center text-gray-400 text-[10px] space-y-1 pb-10">
        <p>Lenden v1.0.0</p>
        <p>© 2024 Personal Finance Management</p>
      </div>
    </div>
  );
}

function SettingsItem({ icon, label, value, onClick }: { icon: React.ReactNode, label: string, value: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 border-b border-gray-50 dark:border-gray-800 last:border-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl text-primary">
          {icon}
        </div>
        <span className="font-bold dark:text-white">{label}</span>
      </div>
      <div className="flex items-center gap-2">
         <span className="text-sm font-medium text-gray-400">{value}</span>
         <ChevronRight size={16} className="text-gray-300" />
      </div>
    </button>
  );
}
