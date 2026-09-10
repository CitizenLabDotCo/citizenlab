import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { IAddAiTurn, IAiTurn } from './types';

const addAiTurn = ({ sessionId, user_message, tool_results }: IAddAiTurn) =>
  fetcher<IAiTurn>({
    path: `/custom_block_ai_sessions/${sessionId}/turns`,
    action: 'post',
    body: { turn: { user_message, tool_results } },
  });

// Pure RPC-style mutation: the turn is not a cached resource, so there is
// nothing to invalidate here.
const useAddAiTurn = () => {
  return useMutation<IAiTurn, CLErrors, IAddAiTurn>({
    mutationFn: addAiTurn,
  });
};

export default useAddAiTurn;
