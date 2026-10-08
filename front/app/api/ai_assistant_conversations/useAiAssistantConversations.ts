import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import aiAssistantConversationsKeys from './keys';
import {
  AiAssistantContextKey,
  AiAssistantConversationsKeys,
  IAiAssistantConversations,
} from './types';

type Parameters = { contextKey: AiAssistantContextKey; contextId: string };

const fetchConversations = ({ contextKey, contextId }: Parameters) =>
  fetcher<IAiAssistantConversations>({
    path: '/ai_assistant_conversations',
    action: 'get',
    queryParams: { context_key: contextKey, context_id: contextId },
  });

// The current user's latest conversation in the context, if any (data[0]).
const useAiAssistantConversations = (parameters: Parameters) => {
  return useQuery<
    IAiAssistantConversations,
    CLErrors,
    IAiAssistantConversations,
    AiAssistantConversationsKeys
  >({
    queryKey: aiAssistantConversationsKeys.list(parameters),
    queryFn: () => fetchConversations(parameters),
  });
};

export default useAiAssistantConversations;
