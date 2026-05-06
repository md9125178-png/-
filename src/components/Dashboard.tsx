import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { useApp } from '../AppContext';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { user, t, language } = useApp();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(20)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setRecentTransactions(txs);

      let inc = 0;
      let exp = 0;
      txs.forEach(t => {
        if (t.type === 'income') inc += t.amount;
        else exp += t.amount;
      });
      setSummary({ income: inc, expense: exp, balance: inc - exp });

      // Group by date for chart (last 7 days of transactions)
      const grouped = txs.reduce((acc: any, t) => {
        const date = t.date;
        if (!acc[date]) acc[date] = { date, income: 0, expense: 0 };
        acc[date][t.type] += t.amount;
        return acc;
      }, {});
      
      const chart = Object.values(grouped).sort((a: any, b: any) => a.date.localeCompare(b.date));
      setChartData(chart);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'transactions'));

    return unsub;
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-primary p-6 rounded-[2rem] text-white space-y-4 shadow-xl shadow-primary/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/70 text-sm font-medium">{t('totalBalance')}</p>
            <h2 className="text-4xl font-bold mt-1 tracking-tight">{formatCurrency(summary.balance)}</h2>
          </div>
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
            <Wallet size={24} />
          </div>
        </div>
        <div className="flex gap-4 pt-4 border-t border-white/10">
          <div className="flex-1">
            <p className="text-white/60 text-xs mb-1 uppercase tracking-wider">{t('income')}</p>
            <div className="flex items-center gap-1">
              <div className="bg-green-400/20 p-1 rounded-md"><ArrowDownLeft size={14} className="text-green-400" /></div>
              <span className="font-semibold">{formatCurrency(summary.income)}</span>
            </div>
          </div>
          <div className="flex-1 border-l border-white/10 pl-4">
            <p className="text-white/60 text-xs mb-1 uppercase tracking-wider">{t('expense')}</p>
            <div className="flex items-center gap-1">
              <div className="bg-red-400/20 p-1 rounded-md"><ArrowUpRight size={14} className="text-red-400" /></div>
              <span className="font-semibold text-red-50"></span >{formatCurrency(summary.expense)}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2 dark:text-white">
            <TrendingUp size={20} className="text-primary" />
            {t('summary')}
          </h3>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary" /> Income</span>
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400" /> Expense</span>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <Tooltip 
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                labelFormatter={(value) => formatDate(value, language)}
              />
              <Area type="monotone" dataKey="income" stroke="var(--primary)" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
              <Area type="monotone" dataKey="expense" stroke="#f87171" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white">{t('recentTransactions')}</h3>
          <button className="text-primary text-sm font-semibold">{t('history')}</button>
        </div>
        <div className="space-y-3">
          {recentTransactions.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl text-center border border-dashed border-gray-200 dark:border-gray-800">
               <Calendar size={40} className="mx-auto text-gray-300 mb-2" />
               <p className="text-gray-500 dark:text-gray-400 text-sm">{t('noTransactions')}</p>
            </div>
          ) : (
            recentTransactions.map(tx => (
              <div key={tx.id} className="bg-white dark:bg-gray-900 p-4 rounded-3xl flex items-center justify-between border border-gray-50 dark:border-gray-800 shadow-sm active:scale-[0.98] transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${tx.type === 'income' ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {tx.type === 'income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{tx.category}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(tx.date, language)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  {tx.note && <p className="text-[10px] text-gray-400 dark:text-gray-500 max-w-[100px] truncate">{tx.note}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
