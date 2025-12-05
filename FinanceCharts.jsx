import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

export default function FinanceCharts({transactions}) {
  const income = transactions.filter(t => t.type === 'INCOME').reduce((s,t)=>s + Number(t.amount),0);
  const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((s,t)=>s + Number(t.amount),0);
  const dataOverview = [
    { name: 'Income', value: income },
    { name: 'Expense', value: expense }
  ];

  // simple category breakdown by description words (sample)
  const categoryMap = {};
  transactions.forEach(t => {
    const key = (t.description || 'Other').split(' ')[0];
    categoryMap[key] = (categoryMap[key] || 0) + Number(t.amount || 0);
  });
  const categoryData = Object.keys(categoryMap).slice(0,5).map((k,i)=>({ name: k, value: categoryMap[k] }));

  return (
    <div style={{display:'flex',gap:16,flexWrap:'wrap',alignItems:'stretch'}}>
      <div style={{flex:'1 1 320px',minWidth:260,height:260}} className="card">
        <h4 style={{margin:'0 0 8px'}}>Income vs Expense</h4>
        <ResponsiveContainer width="100%" height="80%">
          <PieChart>
            <Pie data={dataOverview} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
              {dataOverview.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(value)=>`₹${Number(value).toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{flex:'1 1 320px',minWidth:260,height:260}} className="card">
        <h4 style={{margin:'0 0 8px'}}>Top Categories (sample)</h4>
        <ResponsiveContainer width="100%" height="80%">
          <PieChart>
            <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
              {categoryData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(value)=>`₹${Number(value).toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
