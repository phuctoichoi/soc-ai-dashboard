import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  stats: {
    waiting: number;
    queued: number;
    processing: number;
    approved: number;
    rejected: number;
    failed: number;
    suppressed: number;
  };
  viewMode: 'investigate' | 'analytics';
  onViewModeChange: (mode: 'investigate' | 'analytics') => void;
}

export const Header: React.FC<HeaderProps> = ({ stats, viewMode, onViewModeChange }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header style={styles.header}>
      <div style={styles.topRow}>
        <div style={styles.logoArea}>
          <svg style={styles.logoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <h1 style={styles.title}>{t('dashboard_title')}</h1>
        </div>

        <div style={styles.rightControls}>
          {/* View Mode Toggle Switch */}
          <div style={styles.viewToggle}>
            <button
              onClick={() => onViewModeChange('investigate')}
              style={{
                ...styles.toggleBtn,
                ...(viewMode === 'investigate' ? styles.toggleBtnActive : {})
              }}
            >
              {t('case_details')}
            </button>
            <button
              onClick={() => onViewModeChange('analytics')}
              style={{
                ...styles.toggleBtn,
                ...(viewMode === 'analytics' ? styles.toggleBtnActive : {})
              }}
            >
              {t('statistics')}
            </button>
          </div>

          {/* Language Selector */}
          <div style={styles.langSelector}>
            <button
              onClick={() => setLanguage('vn')}
              style={{
                ...styles.langBtn,
                ...(language === 'vn' ? styles.langBtnActive : {})
              }}
            >
              <span style={styles.flagIcon}>🇻🇳</span> Tiếng Việt
            </button>
            <button
              onClick={() => setLanguage('en')}
              style={{
                ...styles.langBtn,
                ...(language === 'en' ? styles.langBtnActive : {})
              }}
            >
              <span style={styles.flagIcon}>🇬🇧</span> English
            </button>
          </div>
        </div>
      </div>

      <div style={styles.statsRow}>
        <span style={styles.statsLabel}>{t('statistics')}:</span>
        <div style={styles.statsContainer}>
          <div style={{ ...styles.statBox, ...styles.statBoxWaiting }}>
            <span style={styles.statCount}>{stats.waiting}</span>
            <span style={styles.statLabelText}>{t('status_waiting')}</span>
          </div>
          <div style={{ ...styles.statBox, ...styles.statBoxQueued }}>
            <span style={styles.statCount}>{stats.queued}</span>
            <span style={styles.statLabelText}>{t('status_queued')}</span>
          </div>
          <div style={{ ...styles.statBox, ...styles.statBoxProcessing }}>
            <span style={styles.statCount}>{stats.processing}</span>
            <span style={styles.statLabelText}>{t('status_processing')}</span>
          </div>
          <div style={{ ...styles.statBox, ...styles.statBoxApproved }}>
            <span style={styles.statCount}>{stats.approved}</span>
            <span style={styles.statLabelText}>{t('status_approved')}</span>
          </div>
          <div style={{ ...styles.statBox, ...styles.statBoxRejected }}>
            <span style={styles.statCount}>{stats.rejected}</span>
            <span style={styles.statLabelText}>{t('status_rejected')}</span>
          </div>
          <div style={{ ...styles.statBox, ...styles.statBoxFailed }}>
            <span style={styles.statCount}>{stats.failed}</span>
            <span style={styles.statLabelText}>{t('status_failed')}</span>
          </div>
          <div style={{ ...styles.statBox, ...styles.statBoxSuppressed }}>
            <span style={styles.statCount}>{stats.suppressed}</span>
            <span style={styles.statLabelText}>{t('status_suppressed')}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '1rem 1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
    flexShrink: 0
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  logoIcon: {
    width: '1.75rem',
    height: '1.75rem',
    color: '#2563eb'
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#111827',
    letterSpacing: '-0.025em'
  },
  rightControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  viewToggle: {
    display: 'flex',
    gap: '0.25rem',
    backgroundColor: '#f3f4f6',
    padding: '0.25rem',
    borderRadius: '8px'
  },
  toggleBtn: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    padding: '0.375rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#4b5563',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    transition: 'all 0.15s ease'
  },
  toggleBtnActive: {
    backgroundColor: '#ffffff',
    color: '#2563eb',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
  },
  langSelector: {
    display: 'flex',
    gap: '0.25rem',
    backgroundColor: '#f3f4f6',
    padding: '0.25rem',
    borderRadius: '8px'
  },
  langBtn: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    padding: '0.375rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#4b5563',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    transition: 'all 0.15s ease'
  },
  langBtnActive: {
    backgroundColor: '#ffffff',
    color: '#111827',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
  },
  flagIcon: {
    fontSize: '0.9375rem'
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.8125rem',
    color: '#4b5563',
    borderTop: '1px dashed #e5e7eb',
    paddingTop: '0.75rem'
  },
  statsLabel: {
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    fontSize: '0.75rem'
  },
  statsContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem'
  },
  statBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.25rem 0.625rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 500,
    border: '1px solid transparent'
  },
  statCount: {
    fontWeight: 700,
    fontSize: '0.8125rem'
  },
  statLabelText: {
    opacity: 0.85
  },
  statBoxWaiting: {
    color: '#d97706',
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a'
  },
  statBoxQueued: {
    color: '#4f46e5',
    backgroundColor: '#e0e7ff',
    borderColor: '#c7d2fe'
  },
  statBoxProcessing: {
    color: '#0284c7',
    backgroundColor: '#e0f2fe',
    borderColor: '#bae6fd'
  },
  statBoxApproved: {
    color: '#059669',
    backgroundColor: '#d1fae5',
    borderColor: '#a7f3d0'
  },
  statBoxRejected: {
    color: '#b91c1c',
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5'
  },
  statBoxFailed: {
    color: '#7c2d12',
    backgroundColor: '#ffedd5',
    borderColor: '#fed7aa'
  },
  statBoxSuppressed: {
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb'
  }
};
