import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { NO_PLACEHOLDER_DATA } from 'utils/cl-react-query/queryClient';

import aiAssistantConversationsKeys from './keys';
import {
  AiAssistantConversationsKeys,
  IAiAssistantConversation,
} from './types';

const fetchConversation = (id?: string) =>
  fetcher<IAiAssistantConversation>({
    path: `/ai_assistant_conversations/${id}`,
    action: 'get',
  });

// Polls while the assistant is working on a turn or waiting for a decision.
const useAiAssistantConversation = (id?: string) => {
  return useQuery<
    IAiAssistantConversation,
    CLErrors,
    IAiAssistantConversation,
    AiAssistantConversationsKeys
  >({
    queryKey: aiAssistantConversationsKeys.item({ id }),
    queryFn: () => fetchConversation(id),
    enabled: !!id,
    // After "New chat", the previous conversation shouldn't show while the new one loads.
    placeholderData: NO_PLACEHOLDER_DATA,
    refetchInterval: ({ state }) => {
      const status = state.data?.data.attributes.status;
      if (status === 'running') return 2000;
      // Loading the conversation recovers interrupted approvals and calls overdue for approval.
      if (status === 'awaiting_approval') return 60000;
      return false;
    },
  });
};

export default useAiAssistantConversation;
