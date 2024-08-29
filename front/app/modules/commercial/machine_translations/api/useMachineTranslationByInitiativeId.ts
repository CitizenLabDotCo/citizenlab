import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import machineTranslationKeys from './keys';
import {
  IMachineTranslation,
  MachineTranslationKeys,
  IMachineTranslationByInitiativeIdParams,
} from './types';

const fetchMachineTranslationByInitiativeId = ({
  initiativeId,
  machine_translation,
}: IMachineTranslationByInitiativeIdParams) =>
  fetcher<IMachineTranslation>({
    path: `/initiatives/${initiativeId}/machine_translation`,
    action: 'get',
    queryParams: { machine_translation },
  });

const useMachineTranslationByInitiativeId = ({
  enabled,
  ...queryParameters
}: IMachineTranslationByInitiativeIdParams & { enabled: boolean }) => {
  return useQuery<
    IMachineTranslation,
    CLErrors,
    IMachineTranslation,
    MachineTranslationKeys
  >({
    queryKey: machineTranslationKeys.item({
      initiativeId: queryParameters.initiativeId,
      machine_translation: queryParameters.machine_translation,
    }),
    queryFn: () => fetchMachineTranslationByInitiativeId(queryParameters),
    enabled,
  });
};

export default useMachineTranslationByInitiativeId;
