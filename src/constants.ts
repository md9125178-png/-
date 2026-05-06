/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const CATEGORIES = {
  INCOME: ['Salary', 'Business', 'Others', 'Gift', 'Investment'],
  EXPENSE: ['Food', 'Transport', 'Medical', 'Family', 'Education', 'Shopping', 'Utilities', 'Rent', 'Others']
};

export const LEDGER_TYPES = {
  RECEIVABLE: 'receivable', // I will receive (Customer owes me)
  PAYABLE: 'payable',      // I need to pay (I owe customer)
  RECEIVED: 'received',    // Customer paid me
  PAID: 'paid'             // I paid customer
};

export const LANGUAGES = {
  EN: 'en',
  BN: 'bn'
};

export const TRANSLATIONS = {
  en: {
    dashboard: 'Dashboard',
    income: 'Income',
    expense: 'Expense',
    ledger: 'Ledger',
    reports: 'Reports',
    summary: 'Summary',
    totalBalance: 'Total Balance',
    totalIncome: 'Total Income',
    totalExpense: 'Total Expense',
    receivable: 'Receivable',
    payable: 'Payable',
    addTransaction: 'Add Transaction',
    addCustomer: 'Add Customer',
    customerName: 'Customer Name',
    phone: 'Phone',
    address: 'Address',
    amount: 'Amount',
    category: 'Category',
    date: 'Date',
    note: 'Note',
    save: 'Save',
    cancel: 'Cancel',
    history: 'History',
    recentTransactions: 'Recent Transactions',
    noTransactions: 'No transactions found',
    filterByDate: 'Filter by Date',
    categoryBreakdown: 'Category Breakdown',
    export: 'Export',
    settings: 'Settings',
    language: 'Language',
    darkMode: 'Dark Mode',
    signOut: 'Sign Out',
    signInWithGoogle: 'Sign in with Google',
    reminders: 'Daily Reminders',
    reminderTime: 'Reminder Time',
    reminderMsg: 'Did you add your expenses today?',
    reminderTitle: 'Daily Expense Alert',
    alreadyAdded: 'Expenses already recorded for today!',
    enableReminder: 'Enable Daily Reminder',
    soundAlert: 'Sound Alert'
  },
  bn: {
    dashboard: 'ড্যাশবোর্ড',
    income: 'আয়',
    expense: 'ব্যয়',
    ledger: 'লেজার',
    reports: 'রিপোর্ট',
    summary: 'সারসংক্ষেপ',
    totalBalance: 'মোট ব্যালেন্স',
    totalIncome: 'মোট আয়',
    totalExpense: 'মোট ব্যয়',
    receivable: 'পাওনা (Receivable)',
    payable: 'দেনা (Payable)',
    addTransaction: 'লেনদেন যোগ করুন',
    addCustomer: 'কাস্টমার যোগ করুন',
    customerName: 'কাস্টমারের নাম',
    phone: 'ফোন',
    address: 'ঠিকানা',
    amount: 'পরিমাণ',
    category: 'ক্যাটাগরি',
    date: 'তারিখ',
    note: 'নোট',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    history: 'ইতিহাস',
    recentTransactions: 'সাম্প্রতিক লেনদেন',
    noTransactions: 'কোন লেনদেন পাওয়া যায়নি',
    filterByDate: 'তারিখ অনুযায়ী ফিল্টার',
    categoryBreakdown: 'ক্যাটাগরি বিশ্লেষণ',
    export: 'এক্সপোর্ট',
    settings: 'সেটিংস',
    language: 'ভাষা',
    darkMode: 'ডার্ক মোড',
    signOut: 'লগ আউট',
    signInWithGoogle: 'গুগল দিয়ে সাইন ইন',
    reminders: 'প্রতিদিনের রিমাইন্ডার',
    reminderTime: 'রিমাইন্ডারের সময়',
    reminderMsg: 'আজকের খরচগুলো যোগ করেছেন কি?',
    reminderTitle: 'প্রতিদিনের খরচ এলার্ট',
    alreadyAdded: 'আজকের খরচ আগে থেকেই যোগ করা আছে!',
    enableReminder: 'ডেইলি রিমাইন্ডার চালু করুন',
    soundAlert: 'সাউন্ড ও ভাইব্রেশন'
  }
};
