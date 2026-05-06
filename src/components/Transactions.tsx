import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { useApp } from '../AppContext';
import { Transaction, TransactionType } from '../types';
import { CATEGORIES } from '../constants';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { Plus, X, Trash2, Calendar, Tag, DollarSign, FileText, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { suggestCategory } from '../lib/gemini';

export default function Transactions() {
  const { user, t, language } = useApp();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  
  // Form State
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES.EXPENSE[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (note.length > 3) {
        setIsSuggesting(true);
        const suggestion = await suggestCategory(note, type);
        if (suggestion && CATEGORIES[type.toUpperCase() as keyof typeof CATEGORIES].includes(suggestion)) {
          setCategory(suggestion);
        }
        setIsSuggesting(false);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [note, type]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'transactions'));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount) return;

    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        type,
        amount: parseFloat(amount),
        category,
        date,
        note,
        createdAt: new Date().toISOString()
      });
      setIsAdding(false);
      setAmount('');
      setNote('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'transactions');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'transactions');
    }
  };

  const filtered = transactions.filter(tx => filterType === 'all' || tx.type === filterType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-white">{t('income') + '/' + t('expense')}</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl">
        {['all', 'income', 'expense'].map((f) => (
          <button
            key={f}
            onClick={() => setFilterType(f as any)}
            className={cn(
              "flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all",
              filterType === f ? "bg-white dark:bg-gray-800 text-primary shadow-sm" : "text-gray-500 dark:text-gray-400"
            )}
          >
            {f === 'all' ? t('summary') : t(f)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(tx => (
          <div key={tx.id} className="bg-white dark:bg-gray-900 p-4 rounded-3xl flex items-center justify-between border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${tx.type === 'income' ? 'bg-green-50 text-green-600 dark:bg-green-900/30' : 'bg-red-50 text-red-600 dark:bg-red-900/30'}`}>
                <Plus size={20} className={tx.type === 'expense' ? 'rotate-45' : ''} />
              </div>
              <div>
                <h4 className="font-bold dark:text-white">{tx.category}</h4>
                <p className="text-xs text-gray-500">{formatDate(tx.date, language)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className={cn("font-bold", tx.type === 'income' ? "text-green-600" : "text-red-600")}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </p>
              </div>
              <button 
                onClick={() => handleDelete(tx.id)}
                className="text-gray-300 hover:text-red-500 transition-colors"
                id={`delete-${tx.id}`}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-t-[3rem] md:rounded-[3rem] p-8 space-y-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold dark:text-white">{t('addTransaction')}</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500"><X /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                  {['income', 'expense'].map((tType) => (
                    <button
                      key={tType}
                      type="button"
                      onClick={() => {
                        setType(tType as TransactionType);
                        setCategory(CATEGORIES[tType.toUpperCase() as keyof typeof CATEGORIES][0]);
                      }}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all",
                        type === tType ? "bg-white dark:bg-gray-700 text-primary shadow-sm" : "text-gray-400 dark:text-gray-500"
                      )}
                    >
                      {t(tType)}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="number"
                      placeholder={t('amount')}
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-lg focus:ring-2 ring-primary dark:text-white"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <select
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 ring-primary appearance-none dark:text-white"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {CATEGORIES[type.toUpperCase() as keyof typeof CATEGORIES].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="date"
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 ring-primary dark:text-white"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="relative">
                    <FileText className="absolute left-4 top-4 text-gray-400" size={20} />
                    <textarea 
                      placeholder={t('note')}
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 ring-primary h-24 dark:text-white"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                    {isSuggesting && (
                      <div className="absolute right-4 bottom-4 flex items-center gap-1 text-[10px] text-primary animate-pulse font-bold">
                        <Sparkles size={12} /> AI suggesting category...
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all"
                  id="submit-transaction"
                >
                  {t('save')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
