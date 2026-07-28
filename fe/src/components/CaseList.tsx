import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export interface Case {
  case_id: string;
  dedup_hash: string;
  status: string;
  received_at: string;
  updated_at: string;
  raw_alert?: any;
  indicators: {
    src_ip: string | null;
    destination_ip: string | null;
    hostname: string | null;
    username: string | null;
    rule_id: string | null;
    event_type: string | null;
    file: string | null;
    process: string | null;
  };
  ai_result: {
    summary: string | null;
    severity: string | null;
    recommendation: string | null;
    confidence: number | null;
  };
  hitl?: {
    decision: string | null;
    edited_recommendation: string | null;
    feedback: string | null;
    reviewer: string | null;
    reviewed_at: string | null;
  };
  audit_trail: any[];
}

interface CaseListProps {
  cases: Case[];
  selectedCaseId: string | null;
  onSelectCase: (caseId: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export const CaseList: React.FC<CaseListProps> = ({
  cases,
  selectedCaseId,
  onSelectCase,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  const { t } = useLanguage();

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Waiting_HITL':
        return 'badge-waiting';
      case 'Approved':
        return 'badge-approved';
      case 'Rejected':
        return 'badge-rejected';
      case 'Suppressed':
        return 'badge-suppressed';
      case 'Queued_AI':
        return 'badge-queued';
      case 'Processing_AI':
        return 'badge-processing';
      case 'Failed':
        return 'badge-failed';
      default:
        return 'badge-suppressed';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Waiting_HITL':
        return t('status_waiting');
      case 'Approved':
        return t('status_approved');
      case 'Rejected':
        return t('status_rejected');
      case 'Suppressed':
        return t('status_suppressed');
      case 'Queued_AI':
        return t('status_queued');
      case 'Processing_AI':
        return t('status_processing');
      case 'Failed':
        return t('status_failed');
      default:
        return status;
    }
  };

  const formatShortDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + 
             date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.filterArea}>
        {/* Search Input */}
        <div style={styles.searchWrapper}>
          <svg style={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="input-text"
            style={styles.searchInput}
            placeholder={t('search_placeholder')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Status Dropdown */}
        <select
          className="input-text"
          style={styles.selectFilter}
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <option value="">{t('all_statuses')}</option>
          <option value="Waiting_HITL">{t('status_waiting')}</option>
          <option value="Queued_AI">{t('status_queued')}</option>
          <option value="Processing_AI">{t('status_processing')}</option>
          <option value="Approved">{t('status_approved')}</option>
          <option value="Rejected">{t('status_rejected')}</option>
          <option value="Failed">{t('status_failed')}</option>
          <option value="Suppressed">{t('status_suppressed')}</option>
        </select>
      </div>

      {/* Case List Scroll Area */}
      <div style={styles.listArea}>
        {cases.length === 0 ? (
          <div style={styles.emptyState}>{t('no_cases')}</div>
        ) : (
          cases.map((c) => {
            const isSelected = c.case_id === selectedCaseId;
            const severity = c.ai_result?.severity;
            const hostname = c.indicators?.hostname || 'Unknown Host';
            const ruleId = c.indicators?.rule_id ? `Rule: ${c.indicators.rule_id}` : 'No Rule ID';

            return (
              <div
                key={c.case_id}
                onClick={() => onSelectCase(c.case_id)}
                style={{
                  ...styles.caseItem,
                  ...(isSelected ? styles.caseItemSelected : {})
                }}
              >
                <div style={styles.itemHeader}>
                  <span style={styles.caseIdText}>{c.case_id}</span>
                  <span style={styles.timeText}>{formatShortDate(c.received_at)}</span>
                </div>

                <div style={styles.itemMeta}>
                  <span style={styles.hostnameText}>{hostname}</span>
                  <span style={styles.ruleText}>{ruleId}</span>
                </div>

                <div style={styles.itemFooter}>
                  <span className={`badge ${getStatusBadgeClass(c.status)}`} style={styles.statusBadge}>
                    {getStatusLabel(c.status)}
                  </span>
                  
                  {severity && (
                    <span 
                      className={`severity-tag ${
                        severity === 'High' ? 'severity-high' : 
                        severity === 'Medium' ? 'severity-medium' : 'severity-low'
                      }`}
                      style={styles.severityTag}
                    >
                      {severity === 'High' ? t('severity_high') : 
                       severity === 'Medium' ? t('severity_medium') : t('severity_low')}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '320px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    flexShrink: 0
  },
  filterArea: {
    padding: '1rem',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    backgroundColor: '#f9fafb'
  },
  searchWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute' as const,
    left: '0.75rem',
    width: '1rem',
    height: '1rem',
    color: '#9ca3af'
  },
  searchInput: {
    paddingLeft: '2.25rem',
    fontSize: '0.8125rem'
  },
  selectFilter: {
    fontSize: '0.8125rem',
    cursor: 'pointer'
  },
  listArea: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '0.75rem'
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '2rem 1rem',
    color: '#9ca3af',
    fontSize: '0.875rem'
  },
  caseItem: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '0.875rem',
    marginBottom: '0.625rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    boxShadow: '0 1px 2px rgba(0,0,0,0.01)'
  },
  caseItemSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.08)'
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caseIdText: {
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: '#111827'
  },
  timeText: {
    fontSize: '0.75rem',
    color: '#6b7280'
  },
  itemMeta: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.125rem'
  },
  hostnameText: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#374151'
  },
  ruleText: {
    fontSize: '0.75rem',
    color: '#6b7280'
  },
  itemFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.25rem'
  },
  statusBadge: {
    fontSize: '0.6875rem',
    padding: '0.125rem 0.5rem'
  },
  severityTag: {
    fontSize: '0.6875rem'
  }
};
