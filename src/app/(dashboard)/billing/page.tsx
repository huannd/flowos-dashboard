'use client';

import { useState, useEffect } from 'react';
import { billingApi } from '@/lib/api';
import styles from './page.module.css';

export default function BillingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [quota, setQuota] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      billingApi.getPlans().catch(() => []),
      billingApi.getSubscription().catch(() => null),
      billingApi.getQuota().catch(() => null),
    ])
      .then(([p, s, q]) => {
        setPlans(Array.isArray(p) ? p : [
          { id: 'free', name: 'Free', price: 0, executionLimit: 100, features: ['100 lượt chạy/tháng', 'Templates miễn phí', 'Lịch sử 30 ngày'] },
          { id: 'pro', name: 'Pro', price: 199000, executionLimit: 1000, features: ['1,000 lượt chạy/tháng', 'Tất cả templates Premium', 'SSE realtime tracking', 'Hỗ trợ email'] },
          { id: 'business', name: 'Business', price: 599000, executionLimit: 5000, features: ['5,000 lượt chạy/tháng', 'API access', 'Priority support', 'Custom templates'] },
        ]);
        setSubscription(s);
        setQuota(q || { used: 12, limit: 100, remaining: 88 });
      })
      .finally(() => setIsLoading(false));
  }, []);

  const currentPlan = subscription?.plan?.name || 'Free';
  const quotaUsed = quota?.used || 0;
  const quotaLimit = quota?.limit || 100;
  const quotaPercent = Math.min(100, Math.round((quotaUsed / quotaLimit) * 100));

  return (
    <div className={styles.page}>
      <h1>Gói & Quota</h1>

      {/* Quota bar */}
      <div className={styles.quotaCard}>
        <div className={styles.quotaHeader}>
          <div>
            <h3>Gói hiện tại: <span className="text-gradient">{currentPlan}</span></h3>
            <p className={styles.quotaText}>
              {quotaUsed} / {quotaLimit} lượt chạy tháng này
            </p>
          </div>
          <span className={styles.quotaPercent}>{quotaPercent}%</span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${quotaPercent}%`,
              background: quotaPercent > 80
                ? 'var(--color-error)'
                : quotaPercent > 50
                  ? 'var(--color-warning)'
                  : 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
            }}
          />
        </div>
      </div>

      {/* Plans grid */}
      {isLoading ? (
        <div className={styles.planGrid}>
          {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 400 }} />)}
        </div>
      ) : (
        <div className={styles.planGrid}>
          {plans.map((plan) => {
            const isCurrent = plan.name === currentPlan;
            const isPopular = plan.name === 'Pro';
            return (
              <div
                key={plan.id}
                className={`${styles.planCard} ${isCurrent ? styles.currentPlan : ''} ${isPopular ? styles.popularPlan : ''}`}
              >
                {isPopular && <div className={styles.popularBadge}>🔥 Phổ biến nhất</div>}
                <h3 className={styles.planName}>{plan.name}</h3>
                <div className={styles.planPrice}>
                  {plan.price === 0 ? (
                    <span className={styles.priceAmount}>Miễn phí</span>
                  ) : (
                    <>
                      <span className={styles.priceAmount}>
                        {(plan.price / 1000).toFixed(0)}K
                      </span>
                      <span className={styles.pricePeriod}>₫/tháng</span>
                    </>
                  )}
                </div>
                <div className={styles.planLimit}>
                  {plan.executionLimit?.toLocaleString()} lượt/tháng
                </div>
                <ul className={styles.featureList}>
                  {(plan.features || []).map((f: string, i: number) => (
                    <li key={i}>✓ {f}</li>
                  ))}
                </ul>
                <button
                  className={`btn ${isCurrent ? 'btn-secondary' : isPopular ? 'btn-primary' : 'btn-secondary'} btn-lg`}
                  style={{ width: '100%' }}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Gói hiện tại' : 'Nâng cấp'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
