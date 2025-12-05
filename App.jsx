// src/App.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles.css';
import FinanceCharts from './components/FinanceCharts';
import LoginModal from './components/LoginModal';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export default function App() {
  const [txns, setTxns] = useState([]);
  const [form, setForm] = useState({ description: '', amount: '', type: 'EXPENSE', date: '' });
  const [loading, setLoading] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mm_user')); } catch (e) { return null; }
  });

  useEffect(() => { fetchAll(); }, []);

// Replace these two functions in src/App.jsx

// Try to load from backend; if it fails, fall back to localStorage
const fetchAll = async () => {
  setLoading(true);
  try {
    const res = await axios.get(API + '/transactions');
    const backendTxns = res.data || [];
    // load local cached txns
    const local = JSON.parse(localStorage.getItem('mm_txns') || '[]');
    // merge backend + local (avoid duplicates by id)
    const merged = [...backendTxns];
    local.forEach(l => {
      if (!merged.some(b => String(b.id) === String(l.id))) merged.push(l);
    });
    setTxns(merged);
  } catch (e) {
    console.error('Fetch backend failed:', e);
    // fallback: load from localStorage
    const local = JSON.parse(localStorage.getItem('mm_txns') || '[]');
    setTxns(local || []);
  } finally {
    setLoading(false);
  }
};

// Submit: optimistic update + try backend POST, fall back to localStorage on failure
const submit = async (e) => {
  e.preventDefault();
  if (!form.description || !form.amount || !form.date) return alert('Please fill all fields');

  // Create transaction object for UI (use a temporary unique id)
  const newTxn = {
    id: 'local-' + Date.now(),
    description: form.description,
    amount: parseFloat(String(form.amount).replace(/,/g,'')) || 0,
    type: form.type,
    date: form.date
  };

  // Optimistically add to UI immediately
  setTxns(prev => [newTxn, ...prev]);
  setForm({ description: '', amount: '', type: 'EXPENSE', date: '' });

  try {
    // Try backend POST (do not send the temporary id)
    const payload = { description: newTxn.description, amount: newTxn.amount, type: newTxn.type, date: newTxn.date };
    await axios.post(API + '/transactions', payload);
    // After successful POST, refresh from backend to get real ids
    fetchAll();
  } catch (err) {
    console.error('POST failed — saving locally:', err);
    // Save locally so it persists
    const local = JSON.parse(localStorage.getItem('mm_txns') || '[]');
    local.unshift(newTxn);
    localStorage.setItem('mm_txns', JSON.stringify(local));
    alert('Backend unreachable — transaction saved locally and shown in the list.');
  }
};


  const remove = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    await axios.delete(`${API}/transactions/${id}`);
    fetchAll();
  };

  const totalIncome = txns.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = txns.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem('mm_user', JSON.stringify(u));
    setLoginOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mm_user');
  };

  return (
    <div className="container">
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={handleLogin} />

      <div className="header">
        <div className="brand">
          <div className="logo">MM</div>
          <div>
            <div className="title">Money Manager</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Personal Finance Dashboard</div>
          </div>
        </div>

        <div className="nav">
          {user ? (
            <>
              <div style={{ textAlign: 'right', marginRight: 8 }}>
                <div style={{ fontWeight: 700 }}>{user.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{user.email}</div>
              </div>
              <button className="btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn" onClick={() => setLoginOpen(true)}>Login</button>
              <button className="btn primary" onClick={() => setLoginOpen(true)}>Get Started</button>
            </>
          )}
        </div>
      </div>

      {/* HERO & QUICK ADD */}
      <div className="hero">
        <div className="hero-left">
          <div className="hero-card">
            <h2 style={{ margin: 0 }}>Manage your money effortlessly</h2>
            <p style={{ color: 'var(--muted)', marginTop: 8 }}>Track income, control expenses, and view insights — all in one place.</p>
            <div className="stats">
              <div className="stat"><div className="val">₹{totalIncome.toFixed(2)}</div><div className="lbl">Total Income</div></div>
              <div className="stat"><div className="val">₹{totalExpense.toFixed(2)}</div><div className="lbl">Total Expense</div></div>
              <div className="stat"><div className="val">₹{balance.toFixed(2)}</div><div className="lbl">Balance</div></div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="card">
            <h4 style={{ marginBottom: 8 }}>Quick Add</h4>
            <form onSubmit={submit}>
              <div className="form-grid">
                <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <input placeholder="Amount" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="INCOME">INCOME</option>
                  <option value="EXPENSE">EXPENSE</option>
                </select>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="primary" type="submit">Add</button>
                  <button type="button" className="ghost" onClick={() => setForm({ description: '', amount: '', type: 'EXPENSE', date: '' })}>Clear</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Transactions + Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 16, alignItems: 'start' }}>
        <div>
          <div className="card"><h4 style={{ margin: 0 }}>Transactions</h4></div>
          <div className="card table-wrap">
            {loading ? <div style={{ padding: 20 }}>Loading...</div> : (
              <table>
                <thead>
                  <tr><th>Description</th><th>Amount</th><th>Type</th><th>Date</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {txns.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: 18, color: 'var(--muted)' }}>No transactions yet</td></tr>}
                  {txns.map(t => (
                    <tr key={t.id}>
                      <td>{t.description}</td>
                      <td>₹{Number(t.amount).toFixed(2)}</td>
                      <td className={t.type === 'INCOME' ? 'type-income' : 'type-expense'}>{t.type}</td>
                      <td>{t.date}</td>
                      <td><button className="btn" onClick={() => remove(t.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div>
          <div className="card chart-area"><FinanceCharts transactions={txns} /></div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 18, color: 'var(--muted)', fontSize: 13 }}>Made with ❤️ • EduSkills Internship</div>
    </div>
  );
}
