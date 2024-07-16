import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';

import inappropriateContentFlagsKeys from 'api/inappropriate_content_flags/keys';
import moderationsCountKeys from 'api/moderation_count/keys';
import moderationsKeys from 'api/moderations/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import { ISpamReport, ISpamReportAdd } from './types';

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
      queryClient.invalidateQueries({
        queryKey: inappropriateContentFlagsKeys.items(),
      });
    },
  });
};

export default useAddSpamReport;
