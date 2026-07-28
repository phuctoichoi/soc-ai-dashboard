import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { Case } from './CaseList';

interface CaseDetailProps {
  activeCase: Case | null;
  onReviewSubmit: (
    decision: 'Approved' | 'Rejected',
    reviewer: string,
    feedback: string,
    editedRecommendation: string
  ) => Promise<void>;
  isReviewSubmitting: boolean;
}

export const CaseDetail: React.FC<CaseDetailProps> = ({
  activeCase,
  onReviewSubmit,
  isReviewSubmitting,
}) => {
  const { t } = useLanguage();
  
  // HITL Form States
  const [reviewer, setReviewer] = useState(t('reviewer_default'));
  const [feedback, setFeedback] = useState('');
  const [editedRec, setEditedRec] = useState('');

  // AI Assistant Chat States
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Sync reviewer default name on language change
  useEffect(() => {
    setReviewer(t('reviewer_default'));
  }, [activeCase, t]);

  // Reset form states on case selection
  useEffect(() => {
    setFeedback('');
    setEditedRec('');
    setChatQuestion('');
    setChatHistory([]);
  }, [activeCase]);

  if (!activeCase) {
    return (
      <div style={styles.placeholderContainer}>
        <svg style={styles.placeholderIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <p style={styles.placeholderText}>{t('select_case')}</p>
      </div>
    );
  }

  const handleAction = async (decision: 'Approved' | 'Rejected') => {
    await onReviewSubmit(decision, reviewer, feedback, editedRec);
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuestion.trim() || isChatLoading) return;

    const userMsg = chatQuestion.trim();
    setChatHistory((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatQuestion('');
    setIsChatLoading(true);

    try {
      const res = await fetch(`/api/cases/${activeCase.case_id}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg })
      });

      if (!res.ok) {
        throw new Error('Failed to get answer from AI');
      }

      const data = await res.json();
      setChatHistory((prev) => [...prev, { sender: 'ai', text: data.answer }]);
    } catch (err: any) {
      setChatHistory((prev) => [...prev, { sender: 'ai', text: `Error: ${err.message}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getAuditActionLabel = (action: string) => {
    switch (action) {
      case 'INGESTED_THRESHOLD_D4':
        return t('audit_action_ingest');
      case 'AI_CLAIMED':
        return t('audit_action_claim');
      case 'AI_ANALYSIS_COMPLETED':
        return t('audit_action_ai_complete');
      case 'HITL_DECISION':
        return t('audit_action_hitl');
      case 'AI_ANALYSIS_REQUEUED':
        return t('audit_action_requeue');
      case 'AI_ANALYSIS_FAILED_FINAL':
        return t('audit_action_fail');
      default:
        return action;
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

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString();
    } catch {
      return isoString;
    }
  };

  return (
    <div style={styles.container}>
      {/* Title Header area */}
      <div style={styles.detailHeader}>
        <div style={styles.titleWrapper}>
          <h2 style={styles.caseTitle}>{activeCase.case_id}</h2>
          <span className={`badge ${getStatusBadgeClass(activeCase.status)}`}>
            {getStatusLabel(activeCase.status)}
          </span>
        </div>
        <div style={styles.headerMeta}>
          <span>{t('received_at')}: <strong>{formatDate(activeCase.received_at)}</strong></span>
          {activeCase.updated_at && (
            <span> | {t('updated_at')}: <strong>{formatDate(activeCase.updated_at)}</strong></span>
          )}
        </div>
      </div>

      <div style={styles.scrollContent}>
        {/* Indicators and AI analysis panels */}
        <div style={styles.gridRow}>
          {/* Left panel: Indicators */}
          <div className="card" style={styles.cardHalf}>
            <h3 style={styles.cardTitle}>{t('indicators')}</h3>
            <div style={styles.indicatorGrid}>
              <div style={styles.indicatorItem}>
                <span style={styles.indicatorLabel}>Source IP</span>
                <span style={styles.indicatorValue}>{activeCase.indicators.src_ip || 'N/A'}</span>
              </div>
              <div style={styles.indicatorItem}>
                <span style={styles.indicatorLabel}>Destination IP</span>
                <span style={styles.indicatorValue}>{activeCase.indicators.destination_ip || 'N/A'}</span>
              </div>
              <div style={styles.indicatorItem}>
                <span style={styles.indicatorLabel}>Hostname</span>
                <span style={styles.indicatorValue}>{activeCase.indicators.hostname || 'N/A'}</span>
              </div>
              <div style={styles.indicatorItem}>
                <span style={styles.indicatorLabel}>Username</span>
                <span style={styles.indicatorValue}>{activeCase.indicators.username || 'N/A'}</span>
              </div>
              <div style={styles.indicatorItem}>
                <span style={styles.indicatorLabel}>Rule ID</span>
                <span style={styles.indicatorValue}>{activeCase.indicators.rule_id || 'N/A'}</span>
              </div>
              <div style={styles.indicatorItem}>
                <span style={styles.indicatorLabel}>Event Type</span>
                <span style={styles.indicatorValue}>{activeCase.indicators.event_type || 'N/A'}</span>
              </div>
              <div style={styles.indicatorItem}>
                <span style={styles.indicatorLabel}>File Path</span>
                <span style={styles.indicatorValue} title={activeCase.indicators.file || ''}>
                  {activeCase.indicators.file || 'N/A'}
                </span>
              </div>
              <div style={styles.indicatorItem}>
                <span style={styles.indicatorLabel}>Process</span>
                <span style={styles.indicatorValue}>{activeCase.indicators.process || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Right panel: AI analysis */}
          <div className="card" style={styles.cardHalf}>
            <h3 style={styles.cardTitle}>{t('ai_result')}</h3>
            {activeCase.ai_result.summary ? (
              <div style={styles.aiBody}>
                <div style={styles.aiField}>
                  <span style={styles.aiLabel}>{t('ai_summary')}:</span>
                  <p style={styles.aiText}>{activeCase.ai_result.summary}</p>
                </div>
                <div style={styles.aiField}>
                  <span style={styles.aiLabel}>{t('ai_severity')}:</span>
                  <div>
                    <span 
                      className={`severity-tag ${
                        activeCase.ai_result.severity === 'High' ? 'severity-high' : 
                        activeCase.ai_result.severity === 'Medium' ? 'severity-medium' : 'severity-low'
                      }`}
                    >
                      {activeCase.ai_result.severity === 'High' ? t('severity_high') : 
                       activeCase.ai_result.severity === 'Medium' ? t('severity_medium') : t('severity_low')}
                    </span>
                  </div>
                </div>
                <div style={styles.aiField}>
                  <span style={styles.aiLabel}>{t('ai_recommendation')}:</span>
                  <p style={{ ...styles.aiText, ...styles.recText }}>{activeCase.ai_result.recommendation}</p>
                </div>
              </div>
            ) : (
              <div style={styles.noAiData}>{t('no_ai_analysis')}</div>
            )}
          </div>
        </div>

        {/* HITL Intervention Form (only if Waiting_HITL) */}
        {activeCase.status === 'Waiting_HITL' && (
          <div className="card" style={styles.hitlCard}>
            <h3 style={{ ...styles.cardTitle, color: 'var(--color-waiting)' }}>
              {t('hitl_form_title')}
            </h3>
            <div style={styles.formGroup}>
              <label style={styles.label}>{t('hitl_reviewer')} *</label>
              <input
                type="text"
                className="input-text"
                value={reviewer}
                onChange={(e) => setReviewer(e.target.value)}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>{t('hitl_edited_rec')}</label>
              <textarea
                className="textarea"
                placeholder={activeCase.ai_result.recommendation || ''}
                value={editedRec}
                onChange={(e) => setEditedRec(e.target.value)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>{t('hitl_feedback')}</label>
              <textarea
                className="textarea"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            <div style={styles.btnRow}>
              <button
                className="btn btn-primary"
                style={styles.approveBtn}
                onClick={() => handleAction('Approved')}
                disabled={isReviewSubmitting || !reviewer.trim()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('btn_approve')}
              </button>
              
              <button
                className="btn btn-secondary"
                style={styles.rejectBtn}
                onClick={() => handleAction('Rejected')}
                disabled={isReviewSubmitting || !reviewer.trim()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('btn_reject')}
              </button>
            </div>
          </div>
        )}

        {/* If case has been reviewed, display review result */}
        {(activeCase.status === 'Approved' || activeCase.status === 'Rejected') && activeCase.hitl && (
          <div className="card" style={styles.reviewResultCard}>
            <h3 style={styles.cardTitle}>{t('hitl_result_title')}</h3>
            <div style={styles.indicatorGrid}>
              <div style={styles.indicatorItem}>
                <span style={styles.indicatorLabel}>{t('decision_label')}</span>
                <span style={{ 
                  fontWeight: 700, 
                  color: activeCase.status === 'Approved' ? 'var(--color-approved)' : 'var(--color-rejected)' 
                }}>
                  {activeCase.status === 'Approved' ? t('status_approved') : t('status_rejected')}
                </span>
              </div>
              <div style={styles.indicatorItem}>
                <span style={styles.indicatorLabel}>{t('reviewer_label')}</span>
                <span>{activeCase.hitl.reviewer || 'N/A'}</span>
              </div>
              <div style={styles.indicatorItem}>
                <span style={styles.indicatorLabel}>{t('reviewed_time_label')}</span>
                <span>{formatDate(activeCase.hitl.reviewed_at || '')}</span>
              </div>
            </div>
            {activeCase.hitl.edited_recommendation && (
              <div style={styles.resultField}>
                <span style={styles.resultLabel}>{t('edited_rec_label')}</span>
                <p style={styles.resultValueText}>{activeCase.hitl.edited_recommendation}</p>
              </div>
            )}
            {activeCase.hitl.feedback && (
              <div style={styles.resultField}>
                <span style={styles.resultLabel}>{t('feedback_label')}</span>
                <p style={styles.resultValueText}>{activeCase.hitl.feedback}</p>
              </div>
            )}
          </div>
        )}

        {/* Interactive Chat with AI - WOW Element (Aesthetic risk) */}
        <div className="card" style={styles.chatCard}>
          <h3 style={styles.chatCardTitle}>
            <svg style={styles.chatLogo} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742a3 3 0 11-4.043 4.043 3 3 0 014.043-4.043zM19.316 10.742a3 3 0 11-4.043 4.043 3 3 0 014.043-4.043zM15.75 8.25a3 3 0 013-3h.008a3 3 0 013 3v.008a3 3 0 01-3 3H18.75a3 3 0 01-3-3zM8.25 15.75a3 3 0 013-3h.008a3 3 0 013 3v.008a3 3 0 01-3 3H11.25a3 3 0 01-3-3z" />
            </svg>
            Security AI Assistant (qwen2.5:3b)
          </h3>
          
          <div style={styles.chatBox}>
            {chatHistory.length === 0 ? (
              <p style={styles.chatPlaceholder}>{t('chat_placeholder')}</p>
            ) : (
              chatHistory.map((msg, index) => (
                <div 
                  key={index} 
                  style={{
                    ...styles.chatMessage,
                    ...(msg.sender === 'user' ? styles.chatMessageUser : styles.chatMessageAi)
                  }}
                >
                  <strong style={styles.chatSender}>{msg.sender === 'user' ? 'Analyst' : 'AI Agent'}:</strong>
                  <p style={styles.chatTextContent}>{msg.text}</p>
                </div>
              ))
            )}
            {isChatLoading && (
              <div style={{ ...styles.chatMessage, ...styles.chatMessageAi }}>
                <strong style={styles.chatSender}>AI Agent:</strong>
                <p style={styles.chatTextContent}>{t('loading')}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleAskAI} style={styles.chatForm}>
            <input
              type="text"
              className="input-text"
              style={styles.chatInput}
              placeholder={t('chat_input_placeholder')}
              value={chatQuestion}
              onChange={(e) => setChatQuestion(e.target.value)}
              disabled={isChatLoading}
            />
            <button type="submit" className="btn btn-primary" style={styles.chatBtn} disabled={isChatLoading || !chatQuestion.trim()}>
              {t('chat_send')}
            </button>
          </form>
        </div>

        {/* Audit Trail Timeline */}
        <div className="card">
          <h3 style={styles.cardTitle}>{t('audit_trail')}</h3>
          <div style={styles.timeline}>
            {activeCase.audit_trail && activeCase.audit_trail.length > 0 ? (
              activeCase.audit_trail.map((audit: any, idx: number) => (
                <div key={idx} style={styles.timelineItem}>
                  <div style={styles.timelineBadge} />
                  <div style={styles.timelineContent}>
                    <div style={styles.timelineHeader}>
                      <span style={styles.timelineAction}>{getAuditActionLabel(audit.action)}</span>
                      <span style={styles.timelineTime}>{formatDate(audit.at)}</span>
                    </div>
                    <div style={styles.timelineDetails}>
                      <span>Actor: <strong>{audit.actor}</strong></span>
                      {audit.from_status && (
                        <span> | {audit.from_status} → <strong>{audit.to_status}</strong></span>
                      )}
                      {audit.details && (
                        <div style={styles.timelineExtra}>
                          {Object.entries(audit.details || {}).map(([key, val]: [string, any]) => (
                            val && <div key={key}>- {key}: {JSON.stringify(val)}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.noAudit}>{t('no_audit_trail')}</div>
            )}
          </div>
        </div>

        {/* Collapsible Raw Alert JSON */}
        <details className="card" style={styles.collapsibleCard}>
          <summary className="json-summary">{t('raw_alert')}</summary>
          <div className="json-container" style={styles.jsonBox}>
            <pre>{JSON.stringify(activeCase.raw_alert || {}, null, 2)}</pre>
          </div>
        </details>
      </div>
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#f3f4f6',
    height: '100%',
    overflow: 'hidden'
  },
  placeholderContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    color: '#9ca3af',
    backgroundColor: '#f9fafb'
  },
  placeholderIcon: {
    width: '3.5rem',
    height: '3.5rem',
    marginBottom: '1rem',
    color: '#cbd5e1'
  },
  placeholderText: {
    fontSize: '0.9375rem',
    fontWeight: 500
  },
  detailHeader: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.375rem',
    flexShrink: 0
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  caseTitle: {
    fontSize: '1.375rem',
    fontWeight: 800,
    color: '#111827',
    letterSpacing: '-0.025em'
  },
  headerMeta: {
    fontSize: '0.75rem',
    color: '#6b7280'
  },
  scrollContent: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '1.25rem 1.5rem'
  },
  gridRow: {
    display: 'flex',
    gap: '1.25rem',
    marginBottom: '0.25rem'
  },
  cardHalf: {
    flex: 1,
    minWidth: 0 // Prevent flex children from overflowing
  },
  cardTitle: {
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: '1rem',
    borderBottom: '1px solid #f3f4f6',
    paddingBottom: '0.5rem'
  },
  indicatorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '0.75rem'
  },
  indicatorItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.125rem'
  },
  indicatorLabel: {
    fontSize: '0.6875rem',
    color: '#9ca3af',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.025em'
  },
  indicatorValue: {
    fontSize: '0.8125rem',
    color: '#374151',
    fontWeight: 500,
    wordBreak: 'break-all' as const
  },
  aiBody: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.875rem'
  },
  aiField: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem'
  },
  aiLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#4b5563'
  },
  aiText: {
    fontSize: '0.8125rem',
    color: '#111827',
    lineHeight: 1.4
  },
  recText: {
    backgroundColor: '#eff6ff',
    padding: '0.625rem',
    borderRadius: '6px',
    borderLeft: '3px solid #3b82f6',
    fontWeight: 500
  },
  noAiData: {
    fontSize: '0.8125rem',
    color: '#9ca3af'
  },
  hitlCard: {
    borderLeft: '4px solid var(--color-waiting)',
    boxShadow: '0 4px 6px -1px rgba(217, 119, 6, 0.05)'
  },
  formGroup: {
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#4b5563',
    marginBottom: '0.375rem'
  },
  btnRow: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.25rem'
  },
  approveBtn: {
    backgroundColor: 'var(--color-approved)',
    borderColor: 'var(--border-approved)',
    color: '#ffffff',
    padding: '0.625rem 1.25rem',
    fontWeight: 600
  },
  rejectBtn: {
    backgroundColor: 'var(--color-rejected)',
    borderColor: 'var(--border-rejected)',
    color: '#ffffff',
    padding: '0.625rem 1.25rem',
    fontWeight: 600
  },
  reviewResultCard: {
    borderLeft: '4px solid #374151'
  },
  resultField: {
    marginTop: '0.875rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem'
  },
  resultLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#4b5563'
  },
  resultValueText: {
    fontSize: '0.8125rem',
    color: '#111827',
    backgroundColor: '#f9fafb',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #e5e7eb'
  },
  collapsibleCard: {
    padding: '1rem'
  },
  jsonBox: {
    marginTop: '0.5rem',
    maxHeight: '300px'
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    paddingLeft: '0.5rem',
    borderLeft: '2px solid #e5e7eb',
    marginLeft: '0.5rem',
    marginTop: '0.5rem'
  },
  timelineItem: {
    position: 'relative' as const,
    display: 'flex',
    gap: '0.75rem'
  },
  timelineBadge: {
    position: 'absolute' as const,
    left: '-11px',
    top: '4px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    border: '2px solid #ffffff'
  },
  timelineContent: {
    flex: 1
  },
  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#1f2937'
  },
  timelineAction: {
    color: '#111827'
  },
  timelineTime: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    fontWeight: 400
  },
  timelineDetails: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '0.125rem'
  },
  timelineExtra: {
    backgroundColor: '#f8fafc',
    padding: '0.375rem 0.5rem',
    borderRadius: '4px',
    marginTop: '0.25rem',
    fontFamily: 'monospace',
    border: '1px dashed #e2e8f0'
  },
  noAudit: {
    fontSize: '0.8125rem',
    color: '#9ca3af'
  },
  chatCard: {
    borderColor: '#bae6fd',
    backgroundColor: '#f0f9ff',
    boxShadow: '0 2px 4px rgba(2, 132, 199, 0.04)'
  },
  chatCardTitle: {
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: '#0369a1',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  chatLogo: {
    width: '1.25rem',
    height: '1.25rem',
    color: '#0284c7'
  },
  chatBox: {
    backgroundColor: '#ffffff',
    border: '1px solid #e0f2fe',
    borderRadius: '8px',
    padding: '0.75rem',
    minHeight: '120px',
    maxHeight: '220px',
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.625rem',
    marginBottom: '0.75rem'
  },
  chatPlaceholder: {
    color: '#9ca3af',
    fontSize: '0.8125rem',
    textAlign: 'center' as const,
    marginTop: '1.5rem',
    fontStyle: 'italic'
  },
  chatMessage: {
    fontSize: '0.8125rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    lineHeight: 1.4,
    maxWidth: '90%'
  },
  chatMessageUser: {
    backgroundColor: '#f3f4f6',
    alignSelf: 'flex-end' as const,
    color: '#1f2937'
  },
  chatMessageAi: {
    backgroundColor: '#e0f2fe',
    alignSelf: 'flex-start' as const,
    color: '#0369a1'
  },
  chatSender: {
    display: 'block',
    fontSize: '0.6875rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.025em',
    marginBottom: '0.125rem'
  },
  chatTextContent: {
    whiteSpace: 'pre-wrap' as const
  },
  chatForm: {
    display: 'flex',
    gap: '0.5rem'
  },
  chatInput: {
    flex: 1,
    borderColor: '#cbd5e1',
    fontSize: '0.8125rem'
  },
  chatBtn: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontSize: '0.8125rem',
    fontWeight: 600,
    padding: '0.5rem 1rem'
  }
};
