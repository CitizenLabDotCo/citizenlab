import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import phasesKeys from 'api/phases/keys';
import projectsKeys from 'api/projects/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import reportsKeys from './keys';
import { ReportResponse } from './types';

export type AddReport =
  | {
      name: string;
      // phase_id is the phase where the report will be published in
      // not the phase that the report is about
      phase_id?: null;
    }
  | {
      name?: null;
      phase_id: string;
    }
  | {
      name: string;
      community_monitor: boolean;
    }
  | {
      // The report about a whole project. It is named after the project, so it
      // needs no name of its own.
      project_id: string;
      name?: null;
    };

const addReport = async (requestBody: AddReport) =>
  fetcher<ReportResponse>({
    path: '/reports',
    action: 'post',
    body: { report: requestBody },
  });

const useAddReport = () => {
  const queryClient = useQueryClient();
  return useMutation<ReportResponse, CLErrors, AddReport>({
    mutationFn: addReport,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: reportsKeys.lists() });

      const phaseId = data.data.relationships.phase?.data?.id;

      if (phaseId) {
        queryClient.invalidateQueries({
          queryKey: phasesKeys.item({ phaseId }),
        });
      }

      // The project carries the report as a relationship, so it goes stale too.
      if ('project_id' in variables) {
        queryClient.invalidateQueries({
          queryKey: projectsKeys.item({ id: variables.project_id }),
        });
      }
    },
  });
};

export default useAddReport;
