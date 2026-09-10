import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { IAddCustomBlockAiSession, ICustomBlockAiSession } from './types';

const addCustomBlockAiSession = ({ customBlockId }: IAddCustomBlockAiSession) =>
  fetcher<ICustomBlockAiSession>({
    path: `/custom_blocks/${customBlockId}/ai_sessions`,
    action: 'post',
    body: {},
  });

const useAddCustomBlockAiSession = () => {
  return useMutation<ICustomBlockAiSession, CLErrors, IAddCustomBlockAiSession>(
    {
      mutationFn: addCustomBlockAiSession,
    }
  );
};

export default useAddCustomBlockAiSession;
