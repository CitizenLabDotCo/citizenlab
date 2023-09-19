import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { ISpamReport, ISpamReportAdd } from './types';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import moderationsKeys from 'api/moderations/keys';
import moderationsCountKeys from 'api/moderation_count/keys';

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
  const queryClient = useQueryClient();
  return useMutation<ISpamReport, CLErrorsWrapper, ISpamReportAdd>({
    mutationFn: addSpamReport,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: moderationsKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: moderationsCountKeys.items(),
      });
      streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/inappropriate_content_flags`],
      });
    },
  });
};

export default useAddSpamReport;
