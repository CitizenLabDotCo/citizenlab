import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import aiAssistantConversationsKeys from './keys';
import {
  AiAssistantSurfaceKey,
  AiAssistantConversationsKeys,
  IAiAssistantConversations,
} from './types';

type Parameters = { surfaceKey: AiAssistantSurfaceKey; subjectId: string };

const fetchConversations = ({ surfaceKey, subjectId }: Parameters) =>
  fetcher<IAiAssistantConversations>({
    path: '/ai_assistant_conversations',
    action: 'get',
    queryParams: { surface_key: surfaceKey, subject_id: subjectId },
  });

// The current user's latest conversation on the surface, if any (data[0]).
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
