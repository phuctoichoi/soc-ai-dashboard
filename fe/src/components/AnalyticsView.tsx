import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { Case } from './CaseList';

interface AnalyticsViewProps {
  cases: Case[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ cases }) => {
  const { t } = useLanguage();

  // 1. Calculate stats
  const totalCases = cases.length;
  const waitingCount = cases.filter(c => c.status === 'Waiting_HITL').length;
  const approvedCount = cases.filter(c => c.status === 'Approved').length;
  const rejectedCount = cases.filter(c => c.status === 'Rejected').length;
  const suppressedCount = cases.filter(c => c.status === 'Suppressed').length;
  const failedCount = cases.filter(c => c.status === 'Failed').length;
  const queuedCount = cases.filter(c => c.status === 'Queued_AI' || c.status === 'Processing_AI').length;

  const reviewedTotal = approvedCount + rejectedCount;
  const approvalRate = reviewedTotal > 0 ? Math.round((approvedCount / reviewedTotal) * 100) : 0;

  // Severity count
  const highCount = cases.filter(c => c.ai_result?.severity === 'High').length;
  const mediumCount = cases.filter(c => c.ai_result?.severity === 'Medium').length;
  const lowCount = cases.filter(c => c.ai_result?.severity === 'Low').length;

  // 2. Trend by hours (last 8 hours)
  const getTimelineData = () => {
    const hours = Array.from({ length: 8 }, (_, i) => {
      const d = new Date();
      d.setHours(d.getHours() - (7 - i));
      return d;
    });

    return hours.map(hourDate => {
      const hourStr = hourDate.getHours() + ':00';
      const count = cases.filter(c => {
        try {
          const cDate = new Date(c.received_at);
          return cDate.getHours() === hourDate.getHours() && 
                 cDate.getDate() === hourDate.getDate();
        } catch {
          return false;
        }
      }).length;
      return { label: hourStr, value: count };
    });
  };

  const trendData = getTimelineData();
  const maxTrendVal = Math.max(...trendData.map(d => d.value), 1);

  // SVG Chart Dimensions
  const barChartWidth = 320;
  const barChartHeight = 180;
  const lineChartWidth = 450;
  const lineChartHeight = 180;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>{t('statistics')}</h2>
        <p style={styles.subtitle}>{t('analytics_subtitle')}</p>
      </div>

      <div style={styles.scrollContent}>
        {/* Metric Cards Grid */}
        <div style={styles.gridMetrics}>
          <div className="card" style={styles.metricCard}>
            <span style={styles.metricLabel}>{t('total_alerts')}</span>
            <span style={styles.metricValue}>{totalCases}</span>
            <span style={styles.metricSubText}>Alerts Ingested</span>
          </div>
          
          <div className="card" style={{ ...styles.metricCard, borderLeft: '4px solid var(--color-waiting)' }}>
            <span style={styles.metricLabel}>{t('status_waiting').toUpperCase()}</span>
            <span style={{ ...styles.metricValue, color: 'var(--color-waiting)' }}>{waitingCount}</span>
            <span style={styles.metricSubText}>{t('status_waiting')}</span>
          </div>

          <div className="card" style={{ ...styles.metricCard, borderLeft: '4px solid var(--color-approved)' }}>
            <span style={styles.metricLabel}>{t('hitl_approval_rate')}</span>
            <span style={{ ...styles.metricValue, color: 'var(--color-approved)' }}>{approvalRate}%</span>
            <span style={styles.metricSubText}>{approvedCount} approved / {reviewedTotal} reviewed</span>
          </div>

          <div className="card" style={{ ...styles.metricCard, borderLeft: '4px solid var(--color-failed)' }}>
            <span style={styles.metricLabel}>{t('ai_analysis_errors')}</span>
            <span style={{ ...styles.metricValue, color: 'var(--color-failed)' }}>{failedCount}</span>
            <span style={styles.metricSubText}>Retry limit reached</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div style={styles.gridCharts}>
          
          {/* 1. Status Proportion Bar Chart */}
          <div className="card" style={styles.chartCard}>
            <h3 style={styles.chartTitle}>{t('status_distribution')}</h3>
            {totalCases > 0 ? (
              <div style={styles.proportionContainer}>
                {/* Horizontal Stacked Bar */}
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressSegment, width: `${(waitingCount/totalCases)*100}%`, backgroundColor: 'var(--color-waiting)' }} title={`${t('status_waiting')}: ${waitingCount}`} />
                  <div style={{ ...styles.progressSegment, width: `${(approvedCount/totalCases)*100}%`, backgroundColor: 'var(--color-approved)' }} title={`${t('status_approved')}: ${approvedCount}`} />
                  <div style={{ ...styles.progressSegment, width: `${(rejectedCount/totalCases)*100}%`, backgroundColor: 'var(--color-rejected)' }} title={`${t('status_rejected')}: ${rejectedCount}`} />
                  <div style={{ ...styles.progressSegment, width: `${(queuedCount/totalCases)*100}%`, backgroundColor: 'var(--color-queued)' }} title={`${t('ai_queue')}: ${queuedCount}`} />
                  <div style={{ ...styles.progressSegment, width: `${(suppressedCount/totalCases)*100}%`, backgroundColor: 'var(--color-suppressed)' }} title={`${t('status_suppressed')}: ${suppressedCount}`} />
                  <div style={{ ...styles.progressSegment, width: `${(failedCount/totalCases)*100}%`, backgroundColor: 'var(--color-failed)' }} title={`${t('failed_label')}: ${failedCount}`} />
                </div>
                
                {/* Legends */}
                <div style={styles.legendsGrid}>
                  <div style={styles.legendItem}>
                    <span style={{ ...styles.legendDot, backgroundColor: 'var(--color-waiting)' }} />
                    <span style={styles.legendText}>{t('status_waiting')}: <strong>{waitingCount}</strong></span>
                  </div>
                  <div style={styles.legendItem}>
                    <span style={{ ...styles.legendDot, backgroundColor: 'var(--color-approved)' }} />
                    <span style={styles.legendText}>{t('status_approved')}: <strong>{approvedCount}</strong></span>
                  </div>
                  <div style={styles.legendItem}>
                    <span style={{ ...styles.legendDot, backgroundColor: 'var(--color-rejected)' }} />
                    <span style={styles.legendText}>{t('status_rejected')}: <strong>{rejectedCount}</strong></span>
                  </div>
                  <div style={styles.legendItem}>
                    <span style={{ ...styles.legendDot, backgroundColor: 'var(--color-queued)' }} />
                    <span style={styles.legendText}>{t('ai_queue')}: <strong>{queuedCount}</strong></span>
                  </div>
                  <div style={styles.legendItem}>
                    <span style={{ ...styles.legendDot, backgroundColor: 'var(--color-suppressed)' }} />
                    <span style={styles.legendText}>{t('status_suppressed')}: <strong>{suppressedCount}</strong></span>
                  </div>
                  <div style={styles.legendItem}>
                    <span style={{ ...styles.legendDot, backgroundColor: 'var(--color-failed)' }} />
                    <span style={styles.legendText}>{t('failed_label')}: <strong>{failedCount}</strong></span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.noData}>{t('no_data')}</div>
            )}
          </div>

          {/* 2. Severity Bar Chart (SVG-based) */}
          <div className="card" style={styles.chartCard}>
            <h3 style={styles.chartTitle}>{t('severity_distribution')}</h3>
            {highCount || mediumCount || lowCount ? (
              <div style={styles.svgContainer}>
                <svg width="100%" height={barChartHeight} viewBox={`0 0 ${barChartWidth} ${barChartHeight}`}>
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="300" y2="20" stroke="#f3f4f6" strokeWidth="1" />
                  <line x1="40" y1="70" x2="300" y2="70" stroke="#f3f4f6" strokeWidth="1" />
                  <line x1="40" y1="120" x2="300" y2="120" stroke="#f3f4f6" strokeWidth="1" />
                  <line x1="40" y1="150" x2="300" y2="150" stroke="#cbd5e1" strokeWidth="1.5" />

                  {/* Y Axis Labels */}
                  <text x="30" y="153" fontSize="10" fill="#94a3b8" textAnchor="end">0</text>
                  <text x="30" y="123" fontSize="10" fill="#94a3b8" textAnchor="end">{Math.ceil(Math.max(highCount, mediumCount, lowCount) / 2)}</text>
                  <text x="30" y="23" fontSize="10" fill="#94a3b8" textAnchor="end">{Math.max(highCount, mediumCount, lowCount)}</text>

                  {/* Bar drawing logic */}
                  {(() => {
                    const maxVal = Math.max(highCount, mediumCount, lowCount, 1);
                    const calcHeight = (val: number) => (val / maxVal) * 120;
                    
                    const barWidth = 40;
                    const highH = calcHeight(highCount);
                    const medH = calcHeight(mediumCount);
                    const lowH = calcHeight(lowCount);

                    return (
                      <>
                        {/* High Severity Bar */}
                        <rect x="75" y={150 - highH} width={barWidth} height={highH} fill="#dc2626" rx="4" />
                        <text x="95" y={140 - highH} fontSize="11" fontWeight="700" fill="#dc2626" textAnchor="middle">{highCount}</text>
                        <text x="95" y="165" fontSize="11" fill="#4b5563" textAnchor="middle">{t('severity_high')}</text>

                        {/* Medium Severity Bar */}
                        <rect x="155" y={150 - medH} width={barWidth} height={medH} fill="#d97706" rx="4" />
                        <text x="175" y={140 - medH} fontSize="11" fontWeight="700" fill="#d97706" textAnchor="middle">{mediumCount}</text>
                        <text x="175" y="165" fontSize="11" fill="#4b5563" textAnchor="middle">{t('severity_medium')}</text>

                        {/* Low Severity Bar */}
                        <rect x="235" y={150 - lowH} width={barWidth} height={lowH} fill="#059669" rx="4" />
                        <text x="255" y={140 - lowH} fontSize="11" fontWeight="700" fill="#059669" textAnchor="middle">{lowCount}</text>
                        <text x="255" y="165" fontSize="11" fill="#4b5563" textAnchor="middle">{t('severity_low')}</text>
                      </>
                    );
                  })()}
                </svg>
              </div>
            ) : (
              <div style={styles.noData}>{t('no_ai_data_alert')}</div>
            )}
          </div>

          {/* 3. Trend Line Chart (SVG-based) */}
          <div className="card" style={{ ...styles.chartCard, gridColumn: 'span 2' }}>
            <h3 style={styles.chartTitle}>{t('alert_frequency')}</h3>
            <div style={styles.svgContainer}>
              <svg width="100%" height={lineChartHeight} viewBox={`0 0 ${lineChartWidth} ${lineChartHeight}`}>
                {/* Horizontal grid lines */}
                <line x1="40" y1="20" x2="420" y2="20" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="40" y1="70" x2="420" y2="70" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="40" y1="120" x2="420" y2="120" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="40" y1="150" x2="420" y2="150" stroke="#cbd5e1" strokeWidth="1.5" />

                {/* Y Axis Labels */}
                <text x="30" y="153" fontSize="10" fill="#94a3b8" textAnchor="end">0</text>
                <text x="30" y="88" fontSize="10" fill="#94a3b8" textAnchor="end">{Math.ceil(maxTrendVal / 2)}</text>
                <text x="30" y="23" fontSize="10" fill="#94a3b8" textAnchor="end">{maxTrendVal}</text>

                {/* Line drawing logic */}
                {(() => {
                  const stepX = (lineChartWidth - 80) / (trendData.length - 1);
                  const calcY = (val: number) => 150 - (val / maxTrendVal) * 120;
                  
                  const points = trendData.map((d, i) => ({
                    x: 40 + i * stepX,
                    y: calcY(d.value),
                    label: d.label,
                    value: d.value
                  }));

                  // Path string
                  const pathD = points.reduce((acc, p, i) => {
                    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
                  }, '');

                  // Area path string (shaded area below line)
                  const areaD = totalCases > 0 ? `${pathD} L ${points[points.length - 1].x} 150 L 40 150 Z` : '';

                  return (
                    <>
                      {/* Shaded Area */}
                      {areaD && <path d={areaD} fill="rgba(37, 99, 235, 0.05)" />}

                      {/* Trend Line */}
                      <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />

                      {/* Dots and Tooltips */}
                      {points.map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
                          
                          {/* Value label on top of dot if greater than 0 */}
                          {p.value > 0 && (
                            <text x={p.x} y={p.y - 8} fontSize="10" fontWeight="700" fill="#2563eb" textAnchor="middle">
                              {p.value}
                            </text>
                          )}

                          {/* X Axis Label */}
                          <text x={p.x} y="170" fontSize="9" fill="#6b7280" textAnchor="middle">
                            {p.label}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
          
        </div>
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
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    flexShrink: 0
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#111827',
    letterSpacing: '-0.025em'
  },
  subtitle: {
    fontSize: '0.8125rem',
    color: '#6b7280'
  },
  scrollContent: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem'
  },
  gridMetrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  },
  metricCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '1.25rem',
    gap: '0.25rem'
  },
  metricLabel: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    color: '#9ca3af',
    letterSpacing: '0.05em'
  },
  metricValue: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: '#111827',
    lineHeight: 1.1
  },
  metricSubText: {
    fontSize: '0.75rem',
    color: '#6b7280'
  },
  gridCharts: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.25rem'
  },
  chartCard: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  chartTitle: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#374151'
  },
  noData: {
    textAlign: 'center' as const,
    padding: '3rem 1rem',
    color: '#9ca3af',
    fontSize: '0.875rem',
    fontStyle: 'italic'
  },
  proportionContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem'
  },
  progressBar: {
    display: 'flex',
    height: '16px',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#e5e7eb'
  },
  progressSegment: {
    height: '100%',
    transition: 'width 0.3s ease',
    cursor: 'pointer'
  },
  legendsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.625rem'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0
  },
  legendText: {
    fontSize: '0.75rem',
    color: '#4b5563'
  },
  svgContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  }
};
