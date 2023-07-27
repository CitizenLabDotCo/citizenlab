import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import reportLayoutKeys from './keys';
import { ReportLayoutResponse } from './types';
import { JsonMultiloc } from 'components/admin/ContentBuilder/typings';

type ReportLayoutUpdate = {
  id: string;
  craftMultiloc: JsonMultiloc;
};

const updateReportLayout = ({ id, craftMultiloc }: ReportLayoutUpdate) =>
  fetcher<ReportLayoutResponse>({
    path: `/reports/${id}`,
    action: 'patch',
    body: {
      report: {
        layout: {
          craftjs_jsonmultiloc: craftMultiloc,
        },
      },
    },
  });

const useUpdateReportLayout = () => {
  const queryClient = useQueryClient();
  return useMutation<ReportLayoutResponse, CLErrors, ReportLayoutUpdate>({
    mutationFn: updateReportLayout,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: reportLayoutKeys.item({ id: variables.id }),
      });
    },
  });
};

export default useUpdateReportLayout;
