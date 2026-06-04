'use client';

import { useState, useEffect } from 'react';
import { credentialApi } from '@/lib/api';
import styles from './page.module.css';

const CREDENTIAL_TYPES = [
  { type: 'telegram', name: 'Telegram Bot', icon: '✈️', fields: ['botToken', 'channelId'] },
  { type: 'openai', name: 'OpenAI API', icon: '🤖', fields: ['apiKey'] },
  { type: 'google', name: 'Google Sheets', icon: '📊', fields: ['apiKey', 'spreadsheetId'] },
  { type: 'shopee', name: 'Shopee', icon: '🛒', fields: ['partnerId', 'partnerKey', 'shopId'] },
  { type: 'email', name: 'Email SMTP', icon: '📧', fields: ['host', 'port', 'user', 'password'] },
];

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<typeof CREDENTIAL_TYPES[0] | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [credName, setCredName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    credentialApi
      .list()
      .then((res) => setCredentials(Array.isArray(res) ? res : []))
      .catch(() => setCredentials([]))
      .finally(() => setIsLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!selectedType || !credName) return;
    setIsSaving(true);
    try {
      const cred = await credentialApi.create({ name: credName, type: selectedType.type, data: formData });
      setCredentials((prev) => [cred, ...prev]);
      setShowModal(false);
      resetForm();
    } catch { /* ignore */ }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa credential này?')) return;
    try {
      await credentialApi.delete(id);
      setCredentials((prev) => prev.filter((c) => c.id !== id));
    } catch { /* ignore */ }
  };

  const resetForm = () => {
    setSelectedType(null);
    setFormData({});
    setCredName('');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Credentials</h1>
          <p className={styles.subtitle}>Quản lý thông tin xác thực cho các dịch vụ bên thứ ba</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Thêm Credential
        </button>
      </div>

      {isLoading ? (
        <div className={styles.grid}>
          {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}
        </div>
      ) : credentials.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔐</div>
          <h3>Chưa có credential nào</h3>
          <p>Thêm credential để kết nối với Telegram, OpenAI, Google Sheets...</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Thêm Credential
          </button>
        </div>
      ) : (
        <div className={`${styles.grid} stagger`}>
          {credentials.map((cred) => {
            const typeInfo = CREDENTIAL_TYPES.find((t) => t.type === cred.type);
            return (
              <div key={cred.id} className={styles.credCard}>
                <div className={styles.credHeader}>
                  <span className={styles.credIcon}>{typeInfo?.icon || '🔑'}</span>
                  <div>
                    <h4>{cred.name}</h4>
                    <span className={styles.credType}>{typeInfo?.name || cred.type}</span>
                  </div>
                </div>
                <div className={styles.credFooter}>
                  <span className={styles.credDate}>
                    {new Date(cred.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cred.id)}>
                    Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => { setShowModal(false); resetForm(); }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Thêm Credential</h2>

            {!selectedType ? (
              <div className={styles.typeGrid}>
                {CREDENTIAL_TYPES.map((type) => (
                  <button
                    key={type.type}
                    className={styles.typeCard}
                    onClick={() => setSelectedType(type)}
                  >
                    <span className={styles.typeIcon}>{type.icon}</span>
                    <span>{type.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.formSection}>
                <button className="btn btn-ghost btn-sm" onClick={resetForm}>
                  ← Quay lại
                </button>
                <div className="input-group">
                  <label>Tên credential</label>
                  <input
                    className="input"
                    value={credName}
                    onChange={(e) => setCredName(e.target.value)}
                    placeholder={`My ${selectedType.name}`}
                  />
                </div>
                {selectedType.fields.map((field) => (
                  <div key={field} className="input-group">
                    <label>{field}</label>
                    <input
                      className="input"
                      type={field.toLowerCase().includes('password') || field.toLowerCase().includes('key') || field.toLowerCase().includes('token') ? 'password' : 'text'}
                      value={formData[field] || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }))}
                      placeholder={`Nhập ${field}`}
                    />
                  </div>
                ))}
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleAdd}
                  disabled={isSaving || !credName}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  {isSaving ? <><span className="spinner" /> Đang lưu...</> : '🔐 Lưu Credential'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
