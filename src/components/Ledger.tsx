import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { useApp } from '../AppContext';
import { Customer, LedgerEntry, LedgerEntryType } from '../types';
import { LEDGER_TYPES } from '../constants';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { Plus, X, Trash2, User, Phone, MapPin, Receipt, ArrowLeft, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Ledger() {
  const { user, t, language } = useApp();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [isAddingEntry, setIsAddingEntry] = useState(false);

  // Form States
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');

  const [entryType, setEntryType] = useState<LedgerEntryType>('receivable');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryNote, setEntryNote] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'customers'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'customers'));
  }, [user]);

  useEffect(() => {
    if (!selectedCustomer) return;
    const q = query(
      collection(db, 'ledger_entries'),
      where('customerId', '==', selectedCustomer.id),
      orderBy('date', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LedgerEntry)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'ledger_entries'));
  }, [selectedCustomer]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !custName) return;
    try {
      await addDoc(collection(db, 'customers'), {
        userId: user.uid,
        name: custName,
        phone: custPhone,
        address: custAddress,
        createdAt: new Date().toISOString()
      });
      setIsAddingCustomer(false);
      setCustName('');
      setCustPhone('');
      setCustAddress('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'customers');
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCustomer || !entryAmount) return;
    try {
      await addDoc(collection(db, 'ledger_entries'), {
        userId: user.uid,
        customerId: selectedCustomer.id,
        type: entryType,
        amount: parseFloat(entryAmount),
        date: entryDate,
        note: entryNote,
        createdAt: new Date().toISOString()
      });
      setIsAddingEntry(false);
      setEntryAmount('');
      setEntryNote('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'ledger_entries');
    }
  };

  const calculateCustomerBalance = (custId: string) => {
    // This is simplified; in a real app, you might want to aggregate this in Cloud Functions or stored values.
    // Here we'll just use a hook or calculate on the fly for the list.
    // For large lists, this is inefficient.
    return 0; // Placeholder
  };

  if (selectedCustomer) {
    const balance = entries.reduce((acc, e) => {
      if (e.type === 'receivable') return acc + e.amount;
      if (e.type === 'payable') return acc - e.amount;
      if (e.type === 'received') return acc - e.amount;
      if (e.type === 'paid') return acc + e.amount;
      return acc;
    }, 0);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedCustomer(null)} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 dark:text-white"><ArrowLeft size={20} /></button>
          <div>
            <h2 className="text-xl font-bold dark:text-white">{selectedCustomer.name}</h2>
            <p className="text-xs text-gray-500">{selectedCustomer.phone}</p>
          </div>
        </div>

        <div className={cn(
          "p-6 rounded-[2.5rem] text-white flex flex-col items-center justify-center space-y-2 shadow-xl",
          balance >= 0 ? "bg-green-600 shadow-green-600/20" : "bg-red-600 shadow-red-600/20"
        )}>
          <p className="text-white/70 text-sm font-medium">{balance >= 0 ? t('receivable') : t('payable')}</p>
          <h3 className="text-4xl font-bold tracking-tight">{formatCurrency(Math.abs(balance))}</h3>
        </div>

        <div className="flex gap-4">
          <button onClick={() => setIsAddingEntry(true)} className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20">{t('addTransaction')}</button>
        </div>

        <div className="space-y-3">
          {entries.map(e => (
            <div key={e.id} className="bg-white dark:bg-gray-900 p-4 rounded-3xl flex items-center justify-between border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-xl", 
                  e.type === 'receivable' || e.type === 'paid' ? "bg-red-50 text-red-600 dark:bg-red-900/30" : "bg-green-50 text-green-600 dark:bg-green-900/30"
                )}>
                  {e.type === 'receivable' ? <ArrowUpRight size={18} /> : 
                   e.type === 'payable' ? <ArrowDownLeft size={18} /> : 
                   e.type === 'received' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>
                <div>
                   <p className="text-sm font-bold dark:text-white">{t(e.type)}</p>
                   <p className="text-[10px] text-gray-400">{formatDate(e.date, language)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn("font-bold", e.type === 'receivable' || e.type === 'paid' ? "text-red-500" : "text-green-500")}>
                  {formatCurrency(e.amount)}
                </p>
                {e.note && <p className="text-[10px] text-gray-400">{e.note}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Add Entry Modal omitted for brevity, adding it now */}
        <Modal isOpen={isAddingEntry} onClose={() => setIsAddingEntry(false)} title={t('addTransaction')}>
           <form onSubmit={handleAddEntry} className="space-y-6">
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                {['receivable', 'payable', 'received', 'paid'].map(typ => (
                  <button 
                    key={typ} 
                    type="button" 
                    onClick={() => setEntryType(typ as any)}
                    className={cn(
                      "py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                      entryType === typ ? "bg-white dark:bg-gray-700 text-primary shadow-sm" : "text-gray-400"
                    )}
                  >
                    {t(typ)}
                  </button>
                ))}
              </div>
              <input type="number" placeholder={t('amount')} className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl p-4 border-none font-bold text-lg focus:ring-2 ring-primary" value={entryAmount} onChange={e => setEntryAmount(e.target.value)} required />
              <input type="date" className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl p-4 border-none font-medium focus:ring-2 ring-primary" value={entryDate} onChange={e => setEntryDate(e.target.value)} required />
              <textarea placeholder={t('note')} className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl p-4 border-none font-medium focus:ring-2 ring-primary h-24" value={entryNote} onChange={e => setEntryNote(e.target.value)} />
              <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20">{t('save')}</button>
           </form>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-white">{t('ledger')}</h2>
        <button onClick={() => setIsAddingCustomer(true)} className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/20"><Plus size={24} /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customers.map(c => (
          <button 
            key={c.id} 
            onClick={() => setSelectedCustomer(c)}
            className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between group active:scale-95 transition-all text-left"
          >
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <User size={24} />
               </div>
               <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{c.name}</h4>
                  <p className="text-xs text-gray-400 flex items-center gap-1"><Phone size={10} /> {c.phone || '-'}</p>
               </div>
            </div>
            <ArrowLeft className="rotate-180 text-gray-300 group-hover:text-primary transition-colors" size={20} />
          </button>
        ))}
      </div>

      <Modal isOpen={isAddingCustomer} onClose={() => setIsAddingCustomer(false)} title={t('addCustomer')}>
        <form onSubmit={handleAddCustomer} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-2">{t('customerName')}</label>
            <input type="text" className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl p-4 border-none font-medium focus:ring-2 ring-primary" value={custName} onChange={e => setCustName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-2">{t('phone')}</label>
            <input type="text" className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl p-4 border-none font-medium focus:ring-2 ring-primary" value={custPhone} onChange={e => setCustPhone(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-2">{t('address')}</label>
            <textarea className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl p-4 border-none font-medium focus:ring-2 ring-primary h-20" value={custAddress} onChange={e => setCustAddress(e.target.value)} />
          </div>
          <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 mt-4">{t('save')}</button>
        </form>
      </Modal>
    </div>
  );
}

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
        >
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-t-[3rem] md:rounded-[3rem] p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold dark:text-white">{title}</h3>
              <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500"><X /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
