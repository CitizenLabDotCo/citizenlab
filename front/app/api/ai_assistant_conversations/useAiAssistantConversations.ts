import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import aiAssistantConversationsKeys from './keys';
import {
  AiAssistantConversationsKeys,
  IAiAssistantConversations,
  IAiAssistantConversationsParameters,
} from './types';

const fetchConversations = ({
  surfaceKey,
  subjectId,
  pageSize,
}: IAiAssistantConversationsParameters) =>
  fetcher<IAiAssistantConversations>({
    path: '/ai_assistant_conversations',
    action: 'get',
    queryParams: {
      surface_key: surfaceKey,
      subject_id: subjectId,
      'page[size]': pageSize,
    },
  });

// The current user's conversations on the surface, newest first. Nothing is fetched
// before the subject exists.
const useAiAssistantConversations = (
  parameters: IAiAssistantConversationsParameters,
  { enabled = true }: { enabled?: boolean } = {}
) => {
  return useQuery<
    IAiAssistantConversations,
    CLErrors,
    IAiAssistantConversations,
    AiAssistantConversationsKeys
  >({
    queryKey: aiAssistantConversationsKeys.list(parameters),
    queryFn: () => fetchConversations(parameters),
    enabled: enabled && !!parameters.subjectId,
  });
};

export default useAiAssistantConversations;
