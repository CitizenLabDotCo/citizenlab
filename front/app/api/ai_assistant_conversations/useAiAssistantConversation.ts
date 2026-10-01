import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

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

// Polls while the assistant is working on a turn.
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
    refetchInterval: ({ state }) =>
      state.data?.data.attributes.status === 'running' ? 2000 : false,
  });
};

export default useAiAssistantConversation;
