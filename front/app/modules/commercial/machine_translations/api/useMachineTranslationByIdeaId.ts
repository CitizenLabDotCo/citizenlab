import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import {
  IMachineTranslation,
  MachineTranslationKeys,
  IMachineTranslationByIdeaIdParams,
} from './types';
import machineTranslationKeys from './keys';

const fetchMachineTranslationByIdeaId = ({
  ideaId,
  machine_translation,
}: IMachineTranslationByIdeaIdParams) =>
  fetcher<IMachineTranslation>({
    path: `/ideas/${ideaId}/machine_translation`,
    action: 'get',
    queryParams: { machine_translation },
  });

const useMachineTranslationByIdeaId = ({
  enabled,
  ...queryParameters
}: IMachineTranslationByIdeaIdParams & { enabled: boolean }) => {
  return useQuery<
    IMachineTranslation,
    CLErrors,
    IMachineTranslation,
    MachineTranslationKeys
  >({
    queryKey: machineTranslationKeys.item({
      ideaId: queryParameters.ideaId,
      machine_translation: queryParameters.machine_translation,
    }),
    queryFn: () => fetchMachineTranslationByIdeaId(queryParameters),
    enabled,
  });
};

export default useMachineTranslationByIdeaId;
