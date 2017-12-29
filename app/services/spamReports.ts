import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship } from 'typings';

export interface Report {
  user_id?: string;
  reason_code: 'wrong_content' | 'inappropriate' | 'other';
  other_reason?: string;
}

export interface SpamReportResponse {
  data: {
    id: string;
    type: 'spam_reports';
    attributes: Report;
  };
  relationships: {
    [key: string]: IRelationship[]
  };
}

export function sendSpamReport(targetType: 'comments' | 'ideas', targetId: string, spamReport: Report) {
  return streams.add<SpamReportResponse>(`${API_PATH}/${targetType}/${targetId}/spam_reports`, { spam_report: spamReport });
}
