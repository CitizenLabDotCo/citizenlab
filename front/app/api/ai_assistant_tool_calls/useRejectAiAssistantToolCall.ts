import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import aiAssistantConversationsKeys from 'api/ai_assistant_conversations/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import { IAiAssistantToolCall } from './types';

type Variables = { id: string; conversationId: string; reason: string };

const rejectToolCall = ({ id, reason }: Variables) =>
  fetcher<IAiAssistantToolCall>({
    path: `/ai_assistant_tool_calls/${id}/reject`,
    action: 'post',
    body: { ai_assistant_tool_call: { reason } },
  });

const useRejectAiAssistantToolCall = () => {
  const queryClient = useQueryClient();

  return useMutation<IAiAssistantToolCall, CLErrors, Variables>({
    mutationFn: rejectToolCall,
    onSettled: (_toolCall, _error, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: aiAssistantConversationsKeys.item({ id: conversationId }),
      });
    },
  });
};

export default useRejectAiAssistantToolCall;
