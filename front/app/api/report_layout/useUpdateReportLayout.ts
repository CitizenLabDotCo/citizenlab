import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import phasesKeys from 'api/phases/keys';

import { CraftJson } from 'components/admin/ContentBuilder/typings';

import fetcher from 'utils/cl-react-query/fetcher';

import reportLayoutKeys from './keys';
import { ReportLayoutResponse } from './types';

type ReportLayoutUpdate = {
  id: string;
  craftjs_json: CraftJson;
  projectId?: string;
};

const updateReportLayout = ({ id, craftjs_json }: ReportLayoutUpdate) =>
  fetcher<ReportLayoutResponse>({
    path: `/reports/${id}`,
    action: 'patch',
    body: {
      report: {
        layout: {
          craftjs_json,
        },
      },
    },
  });

const useUpdateReportLayout = () => {
  const queryClient = useQueryClient();
  return useMutation<ReportLayoutResponse, CLErrors, ReportLayoutUpdate>({
    mutationFn: updateReportLayout,
    onSuccess: (_data, variables) => {
      const { id, projectId } = variables;

      queryClient.invalidateQueries({
        queryKey: reportLayoutKeys.item({ id }),
      });

      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: phasesKeys.list({ projectId }),
        });
      }
    },
  });
};

export default useUpdateReportLayout;
