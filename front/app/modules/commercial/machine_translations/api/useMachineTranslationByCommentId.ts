import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import {
  IMachineTranslation,
  MachineTranslationKeys,
  IMachineTranslationByCommentIdParams,
} from './types';
import machineTranslationKeys from './keys';

const fetchMachineTranslationByCommentId = ({
  commentId,
  machine_translation,
}: IMachineTranslationByCommentIdParams) =>
  fetcher<IMachineTranslation>({
    path: `/comments/${commentId}/machine_translation`,
    action: 'get',
    queryParams: { machine_translation },
  });

const useMachineTranslationByCommentId = ({
  enabled,
  ...queryParameters
}: IMachineTranslationByCommentIdParams & { enabled: boolean }) => {
  return useQuery<
    IMachineTranslation,
    CLErrors,
    IMachineTranslation,
    MachineTranslationKeys
  >({
    queryKey: machineTranslationKeys.item({
      commentId: queryParameters.commentId,
      machine_translation: queryParameters.machine_translation,
    }),
    queryFn: () => fetchMachineTranslationByCommentId(queryParameters),
    enabled,
  });
};

export default useMachineTranslationByCommentId;
