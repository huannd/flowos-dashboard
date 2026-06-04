'use client';

import { useState, FormEvent } from 'react';
import styles from './DynamicForm.module.css';

interface SchemaProperty {
  type: string;
  title?: string;
  description?: string;
  enum?: string[];
  default?: unknown;
  'x-ui'?: {
    widget?: string;
    rows?: number;
    placeholder?: string;
    labels?: Record<string, string>;
    min?: number;
    max?: number;
    step?: number;
  };
}

interface FormSchema {
  type: string;
  required?: string[];
  properties?: Record<string, SchemaProperty>;
}

interface DynamicFormProps {
  schema: FormSchema;
  onSubmit: (data: Record<string, unknown>) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export default function DynamicForm({
  schema,
  onSubmit,
  isSubmitting,
  submitLabel = 'Submit',
}: DynamicFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (prop.default !== undefined) initial[key] = prop.default;
      }
    }
    return initial;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const required = schema.required || [];

    for (const field of required) {
      const val = values[field];
      if (val === undefined || val === null || val === '') {
        const prop = schema.properties?.[field];
        newErrors[field] = `${prop?.title || field} là bắt buộc`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // Convert numeric strings to numbers
    const processed = { ...values };
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (prop.type === 'number' && typeof processed[key] === 'string') {
          processed[key] = Number(processed[key]);
        }
      }
    }
    onSubmit(processed);
  };

  if (!schema.properties) return null;

  const entries = Object.entries(schema.properties);

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {entries.map(([key, prop]) => (
        <div key={key} className="input-group">
          <label htmlFor={`field-${key}`}>
            {prop.title || key}
            {schema.required?.includes(key) && (
              <span className={styles.required}> *</span>
            )}
          </label>

          {renderField(key, prop, values[key], handleChange, errors[key])}

          {prop.description && (
            <span className="hint">{prop.description}</span>
          )}
          {errors[key] && <span className="error-text">{errors[key]}</span>}
        </div>
      ))}

      <button
        type="submit"
        className={`btn btn-primary btn-lg ${styles.submitBtn}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="spinner" />
            Đang xử lý...
          </>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
}

function renderField(
  key: string,
  prop: SchemaProperty,
  value: unknown,
  onChange: (key: string, value: unknown) => void,
  error?: string,
) {
  const ui = prop['x-ui'] || {};
  const widget = ui.widget || (prop.enum ? 'select' : prop.type === 'string' ? 'text' : 'text');

  switch (widget) {
    case 'textarea':
      return (
        <textarea
          id={`field-${key}`}
          className={`textarea ${error ? 'input-error' : ''}`}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(key, e.target.value)}
          rows={ui.rows || 3}
          placeholder={ui.placeholder}
        />
      );

    case 'select':
      return (
        <select
          id={`field-${key}`}
          className={`select ${error ? 'input-error' : ''}`}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(key, e.target.value)}
        >
          <option value="">-- Chọn --</option>
          {prop.enum?.map((opt) => (
            <option key={opt} value={opt}>
              {ui.labels?.[opt] || opt}
            </option>
          ))}
        </select>
      );

    case 'radio':
      return (
        <div className={styles.radioGroup}>
          {prop.enum?.map((opt) => (
            <label key={opt} className={styles.radioLabel}>
              <input
                type="radio"
                name={key}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(key, opt)}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>
                {ui.labels?.[opt] || opt}
              </span>
            </label>
          ))}
        </div>
      );

    case 'checkbox':
      return (
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(key, e.target.checked)}
            className={styles.checkboxInput}
          />
          <span className={styles.checkboxText}>{prop.title}</span>
        </label>
      );

    case 'number':
      return (
        <input
          id={`field-${key}`}
          type="number"
          className={`input ${error ? 'input-error' : ''}`}
          value={(value as number) ?? ''}
          onChange={(e) => onChange(key, e.target.value)}
          min={ui.min}
          max={ui.max}
          step={ui.step || 1}
          placeholder={ui.placeholder}
        />
      );

    default:
      return (
        <input
          id={`field-${key}`}
          type="text"
          className={`input ${error ? 'input-error' : ''}`}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(key, e.target.value)}
          placeholder={ui.placeholder}
        />
      );
  }
}
