import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, query, collection, where, getDocs, limit } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { TRANSLATIONS } from './constants';
import { UserProfile, Language, Theme } from './types';

interface AppContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  updateSettings: (updates: Partial<UserProfile['settings']>) => Promise<void>;
  t: (key: string) => string;
  showReminder: boolean;
  dismissReminder: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>('bn'); // Default to Bangla
  const [theme, setTheme] = useState<Theme>('light');
  const [showReminder, setShowReminder] = useState(false);
  const [lastCheckedDate, setLastCheckedDate] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          setProfile(data);
          setLanguage(data.settings?.language || 'bn');
          setTheme(data.settings?.theme || 'light');
        } else {
          // Create initial profile
          const newProfile: UserProfile = {
            uid: u.uid,
            name: u.displayName || 'User',
            email: u.email || '',
            settings: { 
              language: 'bn', 
              currency: 'BDT', 
              theme: 'light',
              reminders: { enabled: true, time: '21:00', sound: true }
            },
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'users', u.uid), newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Reminder Checker Logic
  useEffect(() => {
    if (!user || !profile?.settings?.reminders?.enabled) return;

    const interval = setInterval(async () => {
      const now = new Date();
      const currentHm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayStr = now.toISOString().split('T')[0];

      if (currentHm === profile.settings.reminders.time && lastCheckedDate !== todayStr) {
        // Smart Check: Check if user added an expense today
        const q = query(
          collection(db, 'transactions'),
          where('userId', '==', user.uid),
          where('date', '==', todayStr),
          where('type', '==', 'expense'),
          limit(1)
        );
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setShowReminder(true);
          if (profile.settings.reminders.sound && 'vibrate' in navigator) {
            navigator.vibrate(200);
          }
        }
        setLastCheckedDate(todayStr);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user, profile, lastCheckedDate]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const updateSettings = async (updates: Partial<UserProfile['settings']>) => {
    if (user && profile) {
      const newSettings = { ...profile.settings, ...updates };
      await setDoc(doc(db, 'users', user.uid), { ...profile, settings: newSettings });
      setProfile({ ...profile, settings: newSettings });
    }
  };

  const setLanguageAndSave = (lang: Language) => {
    setLanguage(lang);
    updateSettings({ language: lang });
  };

  const setThemeAndSave = (t: Theme) => {
    setTheme(t);
    updateSettings({ theme: t });
  };

  const dismissReminder = () => setShowReminder(false);

  const t = (key: string) => {
    return (TRANSLATIONS[language] as any)[key] || (TRANSLATIONS['en'] as any)[key] || key;
  };

  return (
    <AppContext.Provider value={{ 
      user, profile, loading, language, setLanguage: setLanguageAndSave, 
      theme, setTheme: setThemeAndSave, updateSettings, t,
      showReminder, dismissReminder
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
