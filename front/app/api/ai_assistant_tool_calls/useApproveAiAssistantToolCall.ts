import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import aiAssistantConversationsKeys from 'api/ai_assistant_conversations/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import { IAiAssistantToolCall } from './types';

type Variables = { id: string; conversationId: string };

const approveToolCall = ({ id }: Variables) =>
  fetcher<IAiAssistantToolCall>({
    path: `/ai_assistant_tool_calls/${id}/approve`,
    action: 'post',
    body: {},
  });

const useApproveAiAssistantToolCall = () => {
  const queryClient = useQueryClient();

  return useMutation<IAiAssistantToolCall, CLErrors, Variables>({
    mutationFn: approveToolCall,
    onSettled: (_toolCall, _error, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: aiAssistantConversationsKeys.item({ id: conversationId }),
      });
    },
  });
};

export default useApproveAiAssistantToolCall;
