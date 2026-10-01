import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import reportChatKeys from './keys';
import { IReportChat, ReportChatKeys } from './types';

const fetchReportChat = (reportId: string) =>
  fetcher<IReportChat>({ path: `/reports/${reportId}/chat`, action: 'get' });

// The conversation about one report. Polls while the model owes an answer and
// stops as soon as it has replied, so an idle panel costs nothing.
const useReportChat = (reportId: string, { enabled }: { enabled: boolean }) =>
  useQuery<IReportChat, CLErrors, IReportChat, ReportChatKeys>({
    queryKey: reportChatKeys.item({ reportId }),
    queryFn: () => fetchReportChat(reportId),
    enabled,
    refetchInterval: ({ state }) =>
      state.data?.data.attributes.pending ? 2000 : false,
  });

export default useReportChat;
