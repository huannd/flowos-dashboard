'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import styles from './Sidebar.module.css';

const navItems = [
  { href: '/templates', icon: '📋', label: 'Templates' },
  { href: '/executions', icon: '⚡', label: 'Lịch sử chạy' },
  { href: '/credentials', icon: '🔐', label: 'Credentials' },
  { href: '/billing', icon: '💳', label: 'Gói & Quota' },
  { href: '/settings', icon: '⚙️', label: 'Cài đặt' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Link href="/templates">
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>FlowOS</span>
        </Link>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${
              pathname.startsWith(item.href) ? styles.active : ''
            }`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.userSection}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {user?.fullName?.[0] || user?.email?.[0] || '?'}
          </div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>{user?.fullName || 'User'}</span>
            <span className={styles.userEmail}>{user?.email}</span>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={logout} title="Đăng xuất">
          ↗
        </button>
      </div>
    </aside>
  );
}
