'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import styles from './page.module.css';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');

  return (
    <div className={styles.page}>
      <h1>Cài đặt</h1>

      <div className="card" style={{ maxWidth: 500 }}>
        <h3>Thông tin cá nhân</h3>
        <div className="input-group" style={{ marginTop: 16 }}>
          <label>Email</label>
          <input className="input" value={user?.email || ''} disabled />
        </div>
        <div className="input-group" style={{ marginTop: 12 }}>
          <label>Họ và tên</label>
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Văn A" />
        </div>
        <button className="btn btn-primary" style={{ marginTop: 16 }}>
          Lưu thay đổi
        </button>
      </div>

      <div className="card" style={{ maxWidth: 500, marginTop: 20 }}>
        <h3>Tài khoản</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '12px 0' }}>
          Role: <span className="badge badge-info">{user?.systemRole || 'USER'}</span>
        </p>
        <button className="btn btn-danger" onClick={logout}>
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
