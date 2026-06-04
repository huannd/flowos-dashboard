'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import styles from '../auth.module.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(email, password, fullName || undefined);
      router.push('/templates');
    } catch (err: any) {
      setError(err.data?.message || 'Không thể đăng ký. Vui lòng thử lại.');
    }
    setIsLoading(false);
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authBackground}>
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
      </div>

      <div className={styles.authCard}>
        <div className={styles.logo}>
          <span>⚡</span> FlowOS
        </div>
        <h1>Tạo tài khoản</h1>
        <p className={styles.subtitle}>Bắt đầu tự động hóa miễn phí</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="input-group">
            <label htmlFor="fullName">Họ và tên</label>
            <input
              id="fullName"
              type="text"
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              autoFocus
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? <><span className="spinner" /> Đang xử lý...</> : 'Đăng ký miễn phí'}
          </button>
        </form>

        <p className={styles.footer}>
          Đã có tài khoản?{' '}
          <Link href="/auth/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
