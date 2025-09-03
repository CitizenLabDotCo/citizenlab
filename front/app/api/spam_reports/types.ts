export type ReasonCode = 'wrong_content' | 'inappropriate' | 'other';

export interface ISpamReportData {
  id: string;
  type: 'spam_report';
  attributes: {
    user_id?: string;
    reason_code: ReasonCode;
    other_reason?: string;
  };
}

export interface ISpamReport {
  data: ISpamReportData;
}

export type ISpamReportAdd = {
  targetType: 'comments' | 'ideas';
  targetId: string;
  spam_report: {
    user_id?: string;
    reason_code: ReasonCode;
    other_reason?: string;
  };
};
