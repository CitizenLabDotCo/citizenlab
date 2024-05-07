import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import reportsKeys from './keys';
import { ReportResponse } from './types';

type CopyReport = { id: string };

async function copyReport({ id }: CopyReport) {
  return fetcher<ReportResponse>({
    path: `/reports/${id}/copy`,
    action: 'post',
    body: null,
  });
}

export default function useCopyReport() {
  const queryClient = useQueryClient();
  return useMutation<ReportResponse, CLErrors, CopyReport>({
    mutationFn: copyReport,
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: reportsKeys.lists() });
    },
  });
}
