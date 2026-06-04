'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { executionApi, automationApi, createExecutionStream } from '@/lib/api';
import styles from './page.module.css';

const STATUS_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  PENDING: { icon: '⏳', label: 'Đang chờ', color: 'var(--text-tertiary)' },
  RUNNING: { icon: '⚡', label: 'Đang chạy', color: 'var(--color-info)' },
  SUCCESS: { icon: '✅', label: 'Thành công', color: 'var(--color-success)' },
  ERROR: { icon: '❌', label: 'Lỗi', color: 'var(--color-error)' },
  TIMEOUT: { icon: '⏱️', label: 'Hết thời gian', color: 'var(--color-warning)' },
  CANCELED: { icon: '🚫', label: 'Đã hủy', color: 'var(--text-tertiary)' },
};

export default function ExecutionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [execution, setExecution] = useState<any>(null);
  const [logs, setLogs] = useState<Array<{ event: string; data: any; time: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const sseRef = useRef<EventSource | null>(null);

  useEffect(() => {
    executionApi
      .getById(id as string)
      .then(setExecution)
      .catch(() => {
        setExecution({
          id,
          status: 'RUNNING',
          template: { name: 'Telegram Auto-Post', icon: '✈️' },
          inputData: { message: 'Hello from FlowOS!', parseMode: 'Markdown' },
          createdAt: new Date().toISOString(),
          startedAt: new Date().toISOString(),
        });
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  // SSE connection
  useEffect(() => {
    if (!execution || ['SUCCESS', 'ERROR', 'TIMEOUT', 'CANCELED'].includes(execution.status)) {
      return;
    }

    try {
      const sse = createExecutionStream(id as string);
      sseRef.current = sse;

      sse.addEventListener('status', (e) => {
        const data = JSON.parse(e.data);
        setExecution((prev: any) => ({ ...prev, status: data.status }));
        addLog('status', data);
      });

      sse.addEventListener('node_started', (e) => {
        addLog('node_started', JSON.parse(e.data));
      });

      sse.addEventListener('node_completed', (e) => {
        addLog('node_completed', JSON.parse(e.data));
      });

      sse.addEventListener('completed', (e) => {
        const data = JSON.parse(e.data);
        setExecution((prev: any) => ({
          ...prev,
          status: 'SUCCESS',
          outputData: data.outputData,
          duration: data.duration,
          finishedAt: data.finishedAt,
        }));
        addLog('completed', data);
        sse.close();
      });

      sse.addEventListener('error', (e: any) => {
        try {
          const data = JSON.parse(e.data);
          setExecution((prev: any) => ({
            ...prev,
            status: data.status || 'ERROR',
            errorMessage: data.errorMessage,
          }));
          addLog('error', data);
        } catch { /* SSE connection error */ }
        sse.close();
      });

      sse.addEventListener('canceled', (e) => {
        const data = JSON.parse(e.data);
        setExecution((prev: any) => ({ ...prev, status: 'CANCELED' }));
        addLog('canceled', data);
        sse.close();
      });

      return () => sse.close();
    } catch {
      // SSE not available (demo mode)
    }
  }, [execution?.status, id]);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (event: string, data: any) => {
    setLogs((prev) => [
      ...prev,
      { event, data, time: new Date().toLocaleTimeString('vi-VN') },
    ]);
  };

  const handleCancel = async () => {
    try {
      await automationApi.cancel(id as string);
      setExecution((prev: any) => ({ ...prev, status: 'CANCELED' }));
    } catch { /* ignore */ }
  };

  const handleRetry = async () => {
    try {
      const res = await automationApi.retry(id as string);
      router.push(`/executions/${res.executionId}`);
    } catch { /* ignore */ }
  };

  if (isLoading) {
    return <div className={styles.page}><div className="spinner spinner-lg" /></div>;
  }

  if (!execution) {
    return (
      <div className="empty-state">
        <div className="icon">❌</div>
        <h3>Execution không tồn tại</h3>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[execution.status] || STATUS_CONFIG.PENDING;
  const isActive = ['PENDING', 'RUNNING'].includes(execution.status);

  return (
    <div className={styles.page}>
      <button className="btn btn-ghost" onClick={() => router.back()}>
        ← Quay lại
      </button>

      {/* Status header */}
      <div className={styles.statusHeader} style={{ borderColor: statusConfig.color }}>
        <div className={styles.statusLeft}>
          <span className={styles.statusIcon}>{statusConfig.icon}</span>
          <div>
            <h2>
              {execution.template?.icon} {execution.template?.name}
            </h2>
            <span className={styles.statusText} style={{ color: statusConfig.color }}>
              {statusConfig.label}
              {isActive && <span className={styles.pulsingDot} />}
            </span>
          </div>
        </div>
        <div className={styles.actions}>
          {isActive && (
            <button className="btn btn-danger btn-sm" onClick={handleCancel}>
              Hủy
            </button>
          )}
          {['ERROR', 'TIMEOUT', 'CANCELED'].includes(execution.status) && (
            <button className="btn btn-primary btn-sm" onClick={handleRetry}>
              🔄 Retry
            </button>
          )}
        </div>
      </div>

      <div className={styles.layout}>
        {/* Left: Details */}
        <div className={styles.details}>
          {/* Input data */}
          {execution.inputData && Object.keys(execution.inputData).length > 0 && (
            <div className={styles.section}>
              <h4>📥 Input</h4>
              <pre className={styles.codeBlock}>
                {JSON.stringify(execution.inputData, null, 2)}
              </pre>
            </div>
          )}

          {/* Output data */}
          {execution.outputData && (
            <div className={styles.section}>
              <h4>📤 Output</h4>
              <pre className={styles.codeBlock}>
                {JSON.stringify(execution.outputData, null, 2)}
              </pre>
            </div>
          )}

          {/* Error */}
          {execution.errorMessage && (
            <div className={styles.errorSection}>
              <h4>❌ Error</h4>
              <p>{execution.errorMessage}</p>
            </div>
          )}

          {/* Metadata */}
          <div className={styles.section}>
            <h4>📊 Thông tin</h4>
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Execution ID</span>
                <code className={styles.metaValue}>{execution.id}</code>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Bắt đầu</span>
                <span className={styles.metaValue}>
                  {execution.startedAt
                    ? new Date(execution.startedAt).toLocaleString('vi-VN')
                    : '—'}
                </span>
              </div>
              {execution.finishedAt && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Kết thúc</span>
                  <span className={styles.metaValue}>
                    {new Date(execution.finishedAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              )}
              {execution.duration != null && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Thời lượng</span>
                  <span className={styles.metaValue}>{execution.duration}s</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Live logs */}
        <div className={styles.logsPanel}>
          <h4 className={styles.logsTitle}>
            📡 Live Logs
            {isActive && <span className={styles.liveIndicator}>● LIVE</span>}
          </h4>
          <div className={styles.logsList}>
            {logs.length === 0 && (
              <div className={styles.logEmpty}>
                {isActive ? 'Đang chờ events...' : 'Không có logs'}
              </div>
            )}
            {logs.map((log, i) => (
              <div key={i} className={styles.logEntry}>
                <span className={styles.logTime}>{log.time}</span>
                <span className={styles.logEvent}>{log.event}</span>
                {log.data?.status && (
                  <span className={styles.logStatus}>{log.data.status}</span>
                )}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
