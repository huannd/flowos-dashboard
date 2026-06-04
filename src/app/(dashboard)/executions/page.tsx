'use client';

import { useState, useEffect } from 'react';
import { executionApi } from '@/lib/api';
import Link from 'next/link';
import styles from './page.module.css';

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Đang chờ', className: 'badge-pending' },
  RUNNING: { label: 'Đang chạy', className: 'badge-info' },
  SUCCESS: { label: 'Thành công', className: 'badge-success' },
  ERROR: { label: 'Lỗi', className: 'badge-error' },
  TIMEOUT: { label: 'Hết thời gian', className: 'badge-warning' },
  CANCELED: { label: 'Đã hủy', className: 'badge-pending' },
};

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      executionApi.list({ page, status: statusFilter || undefined }),
      executionApi.getStats(),
    ])
      .then(([res, statsRes]) => {
        setExecutions(res.executions);
        setTotalPages(res.totalPages);
        setStats(statsRes);
      })
      .catch(() => {
        // Demo data
        setStats({
          totalExecutions: 42,
          monthlyExecutions: 18,
          successRate: 88,
          errorCount: 5,
          averageDuration: 7,
        });
        setExecutions([
          { id: '1', status: 'SUCCESS', template: { name: 'Telegram Auto-Post', icon: '✈️' }, createdAt: new Date().toISOString(), duration: 3 },
          { id: '2', status: 'RUNNING', template: { name: 'AI Content Generator', icon: '🤖' }, createdAt: new Date().toISOString(), duration: null },
          { id: '3', status: 'ERROR', template: { name: 'CSV Processing', icon: '📑' }, createdAt: new Date(Date.now() - 86400000).toISOString(), duration: 8, errorMessage: 'Invalid CSV format' },
        ]);
      })
      .finally(() => setIsLoading(false));
  }, [page, statusFilter]);

  const formatDate = (iso: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso));
  };

  return (
    <div className={styles.page}>
      <h1>Lịch sử thực thi</h1>

      {/* Stats */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.monthlyExecutions}</span>
            <span className={styles.statLabel}>Tháng này</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.successRate}%</span>
            <span className={styles.statLabel}>Thành công</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.errorCount}</span>
            <span className={styles.statLabel}>Lỗi</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.averageDuration}s</span>
            <span className={styles.statLabel}>TB thời gian</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <select
          className="select"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ width: 180 }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Đang chờ</option>
          <option value="RUNNING">Đang chạy</option>
          <option value="SUCCESS">Thành công</option>
          <option value="ERROR">Lỗi</option>
          <option value="TIMEOUT">Hết thời gian</option>
          <option value="CANCELED">Đã hủy</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className={styles.tableWrapper}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 56, marginBottom: 4 }} />
          ))}
        </div>
      ) : executions.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <h3>Chưa có execution nào</h3>
          <p>Chạy template đầu tiên để bắt đầu</p>
          <Link href="/templates" className="btn btn-primary">Khám phá Templates</Link>
        </div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Template</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                  <th>Thời lượng</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {executions.map((exec) => {
                  const st = STATUS_MAP[exec.status] || STATUS_MAP.PENDING;
                  return (
                    <tr key={exec.id}>
                      <td>
                        <div className={styles.templateCell}>
                          <span className={styles.templateIcon}>
                            {exec.template?.icon || '⚡'}
                          </span>
                          <span>{exec.template?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${st.className}`}>
                          {exec.status === 'RUNNING' && (
                            <span className={styles.pulsingDot} />
                          )}
                          {st.label}
                        </span>
                      </td>
                      <td className={styles.dateCell}>{formatDate(exec.createdAt)}</td>
                      <td>
                        {exec.duration != null ? `${exec.duration}s` : '—'}
                      </td>
                      <td>
                        <Link
                          href={`/executions/${exec.id}`}
                          className="btn btn-ghost btn-sm"
                        >
                          Chi tiết →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Trước
              </button>
              <span className={styles.pageInfo}>
                Trang {page} / {totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Tiếp →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
