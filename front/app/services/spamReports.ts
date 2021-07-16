import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { IRelationship } from 'typings';

export interface Report {
  user_id?: string;
  reason_code: 'wrong_content' | 'inappropriate' | 'other';
  other_reason?: string;
}

interface ILinks {
  self: string;
  first: string;
  prev: string;
  next: string;
  last: string;
}

export interface SpamReportResponse {
  data: {
    id: string;
    type: 'spam_report';
    attributes: Report;
  };
  relationships: {
    [key: string]: IRelationship[];
  };
  links: ILinks;
}

export async function sendSpamReport(
  targetType: 'comments' | 'ideas' | 'initiatives',
  targetId: string,
  spamReport: Report
) {
  const response = await streams.add<SpamReportResponse>(
    `${API_PATH}/${targetType}/${targetId}/spam_reports`,
    { spam_report: spamReport }
  );

  await streams.fetchAllWith({
    apiEndpoint: [
      `${API_PATH}/inappropriate_content_flags`,
      `${API_PATH}/moderations`,
    ],
  });

  return response;
}
