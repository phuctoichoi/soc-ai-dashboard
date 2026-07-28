import { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Header } from './components/Header';
import { CaseList } from './components/CaseList';
import type { Case } from './components/CaseList';
import { CaseDetail } from './components/CaseDetail';
import { AnalyticsView } from './components/AnalyticsView';

function DashboardContent() {
  const { t } = useLanguage();

  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Waiting_HITL'); // Defaults to show Waiting_HITL cases
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'investigate' | 'analytics'>('investigate');
  
  // Alert states
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 1. Fetch cases from Express Backend
  const fetchCases = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await fetch('/api/cases');
      if (!response.ok) {
        throw new Error('Failed to fetch cases');
      }
      const data = await response.json();
      setCases(data);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Poll database for live updates every 5 seconds
  useEffect(() => {
    fetchCases(true);
    const interval = setInterval(() => {
      fetchCases(false);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Dismiss alert after 6 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // 2. Handle HITL submission
  const handleReviewSubmit = async (
    decision: 'Approved' | 'Rejected',
    reviewer: string,
    feedback: string,
    editedRecommendation: string
  ) => {
    if (!selectedCaseId) return;
    setIsReviewSubmitting(true);
    setAlert(null);

    try {
      const response = await fetch(`/api/cases/${selectedCaseId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          reviewer,
          feedback,
          edited_recommendation: editedRecommendation
        })
      });

      if (response.status === 409) {
        // Concurrency error (CaseNotReviewableError)
        setAlert({
          type: 'error',
          message: t('error_concurrency')
        });
      } else if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Server error');
      } else {
        const updatedCase = await response.json();
        // Update case list locally
        setCases((prevCases) =>
          prevCases.map((c) => (c.case_id === selectedCaseId ? updatedCase : c))
        );
        setAlert({
          type: 'success',
          message: `${t('success_msg')} ${selectedCaseId}`
        });
      }
    } catch (error: any) {
      setAlert({
        type: 'error',
        message: `${t('error_general')} ${error.message}`
      });
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  // 3. Compute statistics for Header
  const getStats = () => {
    return {
      waiting: cases.filter((c) => c.status === 'Waiting_HITL').length,
      queued: cases.filter((c) => c.status === 'Queued_AI').length,
      processing: cases.filter((c) => c.status === 'Processing_AI').length,
      approved: cases.filter((c) => c.status === 'Approved').length,
      rejected: cases.filter((c) => c.status === 'Rejected').length,
      failed: cases.filter((c) => c.status === 'Failed').length,
      suppressed: cases.filter((c) => c.status === 'Suppressed').length,
    };
  };

  // 4. Local Filtering & Searching
  const filteredCases = cases.filter((c) => {
    const matchesStatus = statusFilter === '' || c.status === statusFilter;
    
    if (!matchesStatus) return false;

    if (!searchTerm.trim()) return true;

    const lowerSearch = searchTerm.toLowerCase();
    const matchesId = c.case_id.toLowerCase().includes(lowerSearch);
    const matchesIp = (c.indicators.src_ip || '').toLowerCase().includes(lowerSearch) ||
                      (c.indicators.destination_ip || '').toLowerCase().includes(lowerSearch);
    const matchesRule = (c.indicators.rule_id || '').toLowerCase().includes(lowerSearch);
    const matchesHost = (c.indicators.hostname || '').toLowerCase().includes(lowerSearch);

    return matchesId || matchesIp || matchesRule || matchesHost;
  });

  const activeCase = cases.find((c) => c.case_id === selectedCaseId) || null;

  return (
    <div className="app-container">
      {/* Header with stats */}
      <Header stats={getStats()} viewMode={viewMode} onViewModeChange={setViewMode} />

      {/* Main Panel layout */}
      <div className="main-content">
        {/* Left sidebar - hidden in analytics mode to give maximum screen space to charts */}
        {viewMode === 'investigate' && (
          <CaseList
            cases={filteredCases}
            selectedCaseId={selectedCaseId}
            onSelectCase={setSelectedCaseId}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        )}

        {/* Right Detail Pane */}
        <div style={styles.detailWrapper}>
          {/* Status Alert Banner */}
          {alert && (
            <div 
              style={{
                ...styles.alertBanner,
                backgroundColor: alert.type === 'success' ? '#d1fae5' : '#fee2e2',
                color: alert.type === 'success' ? '#065f46' : '#991b1b',
                borderColor: alert.type === 'success' ? '#a7f3d0' : '#fca5a5'
              }}
            >
              <span>{alert.message}</span>
              <button onClick={() => setAlert(null)} style={styles.closeAlertBtn}>×</button>
            </div>
          )}

          {isLoading ? (
            <div style={styles.loadingWrapper}>
              <div style={styles.spinner} />
              <p style={styles.loadingText}>{t('loading')}</p>
            </div>
          ) : viewMode === 'investigate' ? (
            <CaseDetail
              activeCase={activeCase}
              onReviewSubmit={handleReviewSubmit}
              isReviewSubmitting={isReviewSubmitting}
            />
          ) : (
            <AnalyticsView cases={cases} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <DashboardContent />
    </LanguageProvider>
  );
}

const styles = {
  detailWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    position: 'relative' as const,
    overflow: 'hidden'
  },
  alertBanner: {
    padding: '0.875rem 1.5rem',
    borderBottom: '1px solid transparent',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.875rem',
    fontWeight: 500,
    zIndex: 10
  },
  closeAlertBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    color: 'inherit',
    cursor: 'pointer',
    lineHeight: 1
  },
  loadingWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb'
  },
  spinner: {
    width: '2.5rem',
    height: '2.5rem',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '0.75rem',
    fontSize: '0.875rem',
    color: '#6b7280',
    fontWeight: 500
  }
};
// Add keyframes for spinner dynamically
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
