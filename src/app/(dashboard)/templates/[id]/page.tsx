'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { templateApi, automationApi } from '@/lib/api';
import DynamicForm from '@/components/forms/DynamicForm';
import styles from './page.module.css';

export default function TemplateDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    templateApi
      .getById(id as string)
      .then(setTemplate)
      .catch(() => {
        // Fallback demo template
        setTemplate({
          id,
          name: 'Telegram Channel Auto-Post',
          description: 'Tự động đăng bài viết lên kênh Telegram của bạn',
          longDescription:
            'Gửi tin nhắn văn bản, hình ảnh hoặc nội dung HTML lên kênh Telegram. Hỗ trợ Markdown và HTML format. Yêu cầu Bot Token và Channel ID.',
          icon: '✈️',
          isPremium: false,
          averageRunTime: 3000,
          tags: ['telegram', 'social', 'auto-post'],
          category: { name: 'Social Media', icon: '📱' },
          inputSchema: {
            type: 'object',
            required: ['message'],
            properties: {
              message: {
                type: 'string',
                title: 'Nội dung tin nhắn',
                description: 'Nội dung bài viết (hỗ trợ Markdown)',
                'x-ui': { widget: 'textarea', rows: 5, placeholder: 'Nhập nội dung bài viết...' },
              },
              imageUrl: {
                type: 'string',
                title: 'URL hình ảnh',
                description: 'Link hình ảnh kèm theo (tùy chọn)',
                'x-ui': { widget: 'text', placeholder: 'https://example.com/image.jpg' },
              },
              parseMode: {
                type: 'string',
                title: 'Định dạng',
                enum: ['Markdown', 'HTML', 'MarkdownV2'],
                default: 'Markdown',
                'x-ui': { widget: 'select' },
              },
            },
          },
        });
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleRun = async (inputs: Record<string, unknown>) => {
    setIsRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await automationApi.run({
        templateId: id as string,
        inputs,
      });
      setResult(res);
      // Navigate to execution detail after short delay
      setTimeout(() => {
        router.push(`/executions/${res.executionId}`);
      }, 2000);
    } catch (err: any) {
      setError(err.data?.message || err.message || 'Đã xảy ra lỗi');
    } finally {
      setIsRunning(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className="skeleton" style={{ height: 40, width: 300, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 20, width: 500, marginBottom: 32 }} />
        <div className="skeleton" style={{ height: 400 }} />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="empty-state">
        <div className="icon">❌</div>
        <h3>Template không tồn tại</h3>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <button className={`btn btn-ghost ${styles.backBtn}`} onClick={() => router.back()}>
        ← Quay lại
      </button>

      <div className={styles.layout}>
        {/* Left: Template info */}
        <div className={styles.info}>
          <div className={styles.infoHeader}>
            <span className={styles.icon}>{template.icon}</span>
            <div>
              <h1>{template.name}</h1>
              <div className={styles.meta}>
                <span className={styles.categoryTag}>
                  {template.category?.icon} {template.category?.name}
                </span>
                {template.isPremium && (
                  <span className="badge badge-premium">⭐ Premium</span>
                )}
                <span className={styles.runTime}>
                  ~{Math.ceil((template.averageRunTime || 5000) / 1000)}s
                </span>
              </div>
            </div>
          </div>

          <p className={styles.description}>
            {template.longDescription || template.description}
          </p>

          {template.tags?.length > 0 && (
            <div className={styles.tags}>
              {template.tags.map((tag: string) => (
                <span key={tag} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Success result */}
          {result && (
            <div className={styles.resultCard}>
              <div className={styles.resultIcon}>🚀</div>
              <h3>Đã gửi yêu cầu!</h3>
              <p>Execution ID: <code>{result.executionId}</code></p>
              <p className={styles.resultQuota}>
                Quota: {result.quota?.used}/{result.quota?.limit} lượt
              </p>
              <p className={styles.redirecting}>Đang chuyển đến trang theo dõi...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className={styles.errorCard}>
              <strong>❌ Lỗi</strong>
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Right: Dynamic Form */}
        <div className={styles.formSection}>
          <div className="card">
            <h3 className={styles.formTitle}>Nhập thông tin</h3>
            {template.inputSchema ? (
              <DynamicForm
                schema={template.inputSchema}
                onSubmit={handleRun}
                isSubmitting={isRunning}
                submitLabel="🚀 Chạy Automation"
              />
            ) : (
              <div className="empty-state">
                <p>Template này không yêu cầu input</p>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => handleRun({})}
                  disabled={isRunning}
                >
                  {isRunning ? <span className="spinner" /> : '🚀 Chạy ngay'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
