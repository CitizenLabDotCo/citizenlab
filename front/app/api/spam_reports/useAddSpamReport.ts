import { useMutation } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { ISpamReport, ISpamReportAdd } from './types';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

const addSpamReport = async ({
  targetId,
  targetType,
  ...requestBody
}: ISpamReportAdd) =>
  fetcher<ISpamReport>({
    path: `/${targetType}/${targetId}/spam_reports`,
    action: 'post',
    body: requestBody,
  });

const useAddSpamReport = () => {
  return useMutation<ISpamReport, CLErrorsWrapper, ISpamReportAdd>({
    mutationFn: addSpamReport,
    onSuccess: () => {
      streams.fetchAllWith({
        apiEndpoint: [
          `${API_PATH}/inappropriate_content_flags`,
          `${API_PATH}/moderations`,
        ],
      });
    },
  });
};

export default useAddSpamReport;
