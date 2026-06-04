'use client';

import { useState, useEffect, useMemo } from 'react';
import { templateApi } from '@/lib/api';
import Link from 'next/link';
import styles from './page.module.css';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  isPremium: boolean;
  averageRunTime: number;
  tags: string[];
  category: Category;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([templateApi.list(), templateApi.getCategories()])
      .then(([tplRes, cats]) => {
        setTemplates(tplRes.templates || tplRes as any);
        setCategories(cats as any);
      })
      .catch(() => {
        // Use sample data for demo if API is not running
        setCategories([
          { id: '1', name: 'Social Media', slug: 'social-media', icon: '📱' },
          { id: '2', name: 'Marketing', slug: 'marketing', icon: '📣' },
          { id: '3', name: 'E-Commerce', slug: 'e-commerce', icon: '🛒' },
          { id: '4', name: 'AI Tools', slug: 'ai-tools', icon: '🤖' },
          { id: '5', name: 'Productivity', slug: 'productivity', icon: '⚡' },
          { id: '6', name: 'Notifications', slug: 'notifications', icon: '🔔' },
          { id: '7', name: 'Data Processing', slug: 'data-processing', icon: '📊' },
        ]);
        setTemplates([
          { id: '1', name: 'Telegram Channel Auto-Post', description: 'Tự động đăng bài viết lên kênh Telegram của bạn', icon: '✈️', isPremium: false, averageRunTime: 3000, tags: ['telegram', 'auto-post'], category: { id: '1', name: 'Social Media', slug: 'social-media', icon: '📱' } },
          { id: '2', name: 'AI Content Generator', description: 'Tạo nội dung marketing bằng AI (GPT-4)', icon: '🤖', isPremium: true, averageRunTime: 15000, tags: ['ai', 'content'], category: { id: '4', name: 'AI Tools', slug: 'ai-tools', icon: '🤖' } },
          { id: '3', name: 'Daily Report to Telegram', description: 'Gửi báo cáo hàng ngày tổng hợp từ Google Sheets lên Telegram', icon: '📊', isPremium: false, averageRunTime: 8000, tags: ['report', 'telegram'], category: { id: '6', name: 'Notifications', slug: 'notifications', icon: '🔔' } },
          { id: '4', name: 'Shopee Order Notification', description: 'Nhận thông báo đơn hàng Shopee mới qua Telegram', icon: '🛒', isPremium: true, averageRunTime: 5000, tags: ['shopee', 'notification'], category: { id: '3', name: 'E-Commerce', slug: 'e-commerce', icon: '🛒' } },
          { id: '5', name: 'CSV Data Processing', description: 'Xử lý file CSV: lọc, chuyển đổi và export kết quả', icon: '📑', isPremium: false, averageRunTime: 10000, tags: ['csv', 'data'], category: { id: '7', name: 'Data Processing', slug: 'data-processing', icon: '📊' } },
          { id: '6', name: 'Email Campaign Sender', description: 'Gửi email hàng loạt từ danh sách liên hệ', icon: '📧', isPremium: true, averageRunTime: 30000, tags: ['email', 'campaign'], category: { id: '2', name: 'Marketing', slug: 'marketing', icon: '📣' } },
        ]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const matchCategory =
        activeCategory === 'all' || t.category?.slug === activeCategory;
      const matchSearch =
        !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags?.some((tag) => tag.includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [templates, activeCategory, searchQuery]);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Template Marketplace</h1>
          <p className={styles.subtitle}>
            Chọn template và chạy tự động — không cần code
          </p>
        </div>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={`input ${styles.searchInput}`}
            placeholder="Tìm kiếm template..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      <div className={styles.categories}>
        <button
          className={`${styles.categoryChip} ${activeCategory === 'all' ? styles.active : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          🌐 Tất cả
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.categoryChip} ${activeCategory === cat.slug ? styles.active : ''}`}
            onClick={() => setActiveCategory(cat.slug)}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      {isLoading ? (
        <div className={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`${styles.card} skeleton`} style={{ height: 200 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔍</div>
          <h3>Không tìm thấy template</h3>
          <p>Thử tìm kiếm với từ khóa khác</p>
        </div>
      ) : (
        <div className={`${styles.grid} stagger`}>
          {filtered.map((tpl) => (
            <Link
              key={tpl.id}
              href={`/templates/${tpl.id}`}
              className={styles.card}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>{tpl.icon}</span>
                {tpl.isPremium && (
                  <span className="badge badge-premium">⭐ Premium</span>
                )}
              </div>
              <h3 className={styles.cardTitle}>{tpl.name}</h3>
              <p className={styles.cardDesc}>{tpl.description}</p>
              <div className={styles.cardFooter}>
                <span className={styles.categoryTag}>
                  {tpl.category?.icon} {tpl.category?.name}
                </span>
                <span className={styles.runTime}>
                  ~{Math.ceil((tpl.averageRunTime || 5000) / 1000)}s
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
