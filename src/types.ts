export type Language = 'en' | 'bn';
export type Theme = 'light' | 'dark';

export interface UserSettings {
  language: Language;
  currency: string;
  theme: Theme;
  reminders: {
    enabled: boolean;
    time: string; // HH:mm
    sound: boolean;
  };
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  settings: UserSettings;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export type LedgerEntryType = 'receivable' | 'payable' | 'received' | 'paid';

export interface LedgerEntry {
  id: string;
  userId: string;
  customerId: string;
  type: LedgerEntryType;
  amount: number;
  date: string;
  note: string;
  createdAt: string;
}
