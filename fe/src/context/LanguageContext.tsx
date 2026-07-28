import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

type Language = 'vn' | 'en';

type TranslationKey =
  | 'dashboard_title'
  | 'reviewer_default'
  | 'status_waiting'
  | 'status_approved'
  | 'status_rejected'
  | 'status_suppressed'
  | 'status_queued'
  | 'status_processing'
  | 'status_failed'
  | 'case_id'
  | 'status'
  | 'received_at'
  | 'updated_at'
  | 'raw_alert'
  | 'indicators'
  | 'ai_result'
  | 'ai_summary'
  | 'ai_severity'
  | 'ai_recommendation'
  | 'hitl_form_title'
  | 'hitl_reviewer'
  | 'hitl_edited_rec'
  | 'hitl_feedback'
  | 'btn_approve'
  | 'btn_reject'
  | 'audit_trail'
  | 'no_cases'
  | 'select_case'
  | 'loading'
  | 'search_placeholder'
  | 'all_statuses'
  | 'success_msg'
  | 'error_concurrency'
  | 'error_general'
  | 'severity_high'
  | 'severity_medium'
  | 'severity_low'
  | 'case_details'
  | 'audit_action_ingest'
  | 'audit_action_claim'
  | 'audit_action_ai_complete'
  | 'audit_action_hitl'
  | 'audit_action_requeue'
  | 'audit_action_fail'
  | 'statistics';

const translations: Record<Language, Record<TranslationKey, string>> = {
  vn: {
    dashboard_title: 'HỆ THỐNG GIÁM SÁT AN NINH MẠNG SOC-AI (HITL)',
    reviewer_default: 'SOC Admin',
    status_waiting: 'Chờ HITL duyệt',
    status_approved: 'Đã phê duyệt',
    status_rejected: 'Đã từ chối',
    status_suppressed: 'Triệt tiêu',
    status_queued: 'Chờ AI phân tích',
    status_processing: 'Đang phân tích',
    status_failed: 'Lỗi phân tích',
    case_id: 'Mã Case',
    status: 'Trạng thái',
    received_at: 'Thời gian nhận',
    updated_at: 'Cập nhật lần cuối',
    raw_alert: 'Cảnh báo thô (Wazuh JSON)',
    indicators: 'Chỉ số an ninh (Indicators)',
    ai_result: 'Phân tích từ AI (qwen2.5:3b)',
    ai_summary: 'Tóm tắt sự kiện',
    ai_severity: 'Mức độ nghiêm trọng',
    ai_recommendation: 'Khuyến nghị đề xuất',
    hitl_form_title: 'Kiểm duyệt của Analyst (Human-in-the-Loop)',
    hitl_reviewer: 'Analyst kiểm duyệt',
    hitl_edited_rec: 'Khuyến nghị chỉnh sửa (Để trống nếu đồng ý với AI)',
    hitl_feedback: 'Nhật ký phân tích / Ý kiến phản hồi',
    btn_approve: 'Phê duyệt (Approve)',
    btn_reject: 'Từ chối (Reject)',
    audit_trail: 'Lịch sử xử lý (Audit Trail)',
    no_cases: 'Không có case nào khớp với bộ lọc.',
    select_case: 'Vui lòng chọn một case từ danh sách để xem chi tiết.',
    loading: 'Đang tải dữ liệu...',
    search_placeholder: 'Tìm kiếm theo Case ID, IP, Rule ID...',
    all_statuses: 'Tất cả trạng thái',
    success_msg: 'Quyết định HITL thành công cho Case:',
    error_concurrency: 'Lỗi tranh chấp: Case này đã được duyệt hoặc trạng thái đã bị thay đổi bởi một Analyst khác.',
    error_general: 'Thao tác thất bại. Chi tiết lỗi:',
    severity_high: 'Cao (High)',
    severity_medium: 'Trung bình (Medium)',
    severity_low: 'Thấp (Low)',
    case_details: 'Chi tiết sự kiện',
    audit_action_ingest: 'Tiếp nhận sự kiện (D4)',
    audit_action_claim: 'AI nhận xử lý (Atomic)',
    audit_action_ai_complete: 'AI hoàn thành phân tích',
    audit_action_hitl: 'Quyết định của Analyst (HITL)',
    audit_action_requeue: 'Đưa lại vào hàng đợi AI',
    audit_action_fail: 'Lỗi phân tích AI',
    statistics: 'Thống kê luồng dữ liệu'
  },
  en: {
    dashboard_title: 'SOC-AI CYBERSECURITY MONITORING SYSTEM (HITL)',
    reviewer_default: 'SOC Admin',
    status_waiting: 'Waiting HITL',
    status_approved: 'Approved',
    status_rejected: 'Rejected',
    status_suppressed: 'Suppressed',
    status_queued: 'Queued AI',
    status_processing: 'Processing AI',
    status_failed: 'Failed',
    case_id: 'Case ID',
    status: 'Status',
    received_at: 'Received At',
    updated_at: 'Last Updated',
    raw_alert: 'Raw Alert (Wazuh JSON)',
    indicators: 'Security Indicators',
    ai_result: 'AI Analysis (qwen2.5:3b)',
    ai_summary: 'Incident Summary',
    ai_severity: 'Severity Level',
    ai_recommendation: 'Proposed Recommendation',
    hitl_form_title: 'Analyst Intervention (Human-in-the-Loop)',
    hitl_reviewer: 'Reviewing Analyst',
    hitl_edited_rec: 'Edited Recommendation (Leave blank to use AI recommendation)',
    hitl_feedback: 'Analysis Log / Feedback Comments',
    btn_approve: 'Approve',
    btn_reject: 'Reject',
    audit_trail: 'Audit Trail',
    no_cases: 'No cases match the selected filter.',
    select_case: 'Please select a case from the list to view details.',
    loading: 'Loading data...',
    search_placeholder: 'Search by Case ID, IP, Rule ID...',
    all_statuses: 'All Statuses',
    success_msg: 'HITL decision successfully updated for Case:',
    error_concurrency: 'Conflict error: This case has already been reviewed or state changed by another analyst.',
    error_general: 'Operation failed. Error details:',
    severity_high: 'High',
    severity_medium: 'Medium',
    severity_low: 'Low',
    case_details: 'Case Details',
    audit_action_ingest: 'Event Ingested (D4)',
    audit_action_claim: 'Claimed by AI (Atomic)',
    audit_action_ai_complete: 'AI Analysis Completed',
    audit_action_hitl: 'Analyst HITL Decision',
    audit_action_requeue: 'Re-queued for AI',
    audit_action_fail: 'AI Analysis Failed',
    statistics: 'Pipeline Statistics'
  }
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('vn');

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
