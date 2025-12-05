// src/components/LoginModal.jsx
import React, { useState } from 'react';

export default function LoginModal({ open, onClose, onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return alert('Please enter name and email');
    if (!/^\S+@\S+\.\S+$/.test(email)) return alert('Enter a valid email');
    onLogin({ name: name.trim(), email: email.trim() });
    setName('');
    setEmail('');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        width: 420, maxWidth: '95%', borderRadius: 12, padding: 18,
        background: '#071426', boxShadow: '0 10px 40px rgba(2,6,23,0.8)'
      }}>
        <h3 style={{ margin: 0, marginBottom: 8 }}>Login</h3>
        <p style={{ color: '#9ca3af', marginTop: 0 }}>Enter your name and email to continue.</p>
        <form onSubmit={submit} style={{ display: 'grid', gap: 10, marginTop: 8 }}>
          <input
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)', background: 'transparent', color: 'inherit' }}
          />
          <input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)', background: 'transparent', color: 'inherit' }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn">Cancel</button>
            <button type="submit" className="btn primary">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
}
