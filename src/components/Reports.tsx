import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useApp } from '../AppContext';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Download, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function Reports() {
  const { user, t, language } = useApp();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      const q = query(collection(db, 'transactions'), where('userId', '==', user.uid), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
      setLoading(false);
    }
    fetchData();
  }, [user]);

  const expenseByCategory = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((acc: any, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});

  const pieData = Object.keys(expenseByCategory).map(name => ({
    name,
    value: expenseByCategory[name]
  }));

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'];

  const exportToExcel = () => {
    const data = transactions.map(tx => ({
      Date: tx.date,
      Type: tx.type.toUpperCase(),
      Category: tx.category,
      Amount: tx.amount,
      Note: tx.note
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `Lenden_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading reports...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-white">{t('reports')}</h2>
        <button 
          onClick={exportToExcel}
          className="flex items-center gap-2 bg-primary/10 text-primary py-2 px-4 rounded-xl font-bold hover:bg-primary/20 transition-all text-sm"
        >
          <Download size={18} />
          {t('export')}
        </button>
      </div>

      {transactions.length > 0 ? (
        <>
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
            <h3 className="font-bold text-center dark:text-white uppercase tracking-wider text-sm opacity-50">{t('categoryBreakdown')}</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-800">
             <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-bold dark:text-white">{t('history')}</h3>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 uppercase text-[10px] font-bold tracking-widest">
                      <tr>
                         <th className="px-6 py-4">{t('date')}</th>
                         <th className="px-6 py-4">{t('category')}</th>
                         <th className="px-6 py-4 text-right">{t('amount')}</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {transactions.slice(0, 10).map(tx => (
                        <tr key={tx.id} className="dark:text-gray-300">
                           <td className="px-6 py-4 text-sm">{formatDate(tx.date, language)}</td>
                           <td className="px-6 py-4 font-medium">{tx.category}</td>
                           <td className={cn("px-6 py-4 text-right font-bold", tx.type === 'income' ? 'text-green-500' : 'text-red-500')}>
                              {formatCurrency(tx.amount)}
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </>
      ) : (
        <div className="text-center p-20 text-gray-400">
           <FileText size={48} className="mx-auto mb-4 opacity-20" />
           <p>{t('noTransactions')}</p>
        </div>
      )}
    </div>
  );
}
