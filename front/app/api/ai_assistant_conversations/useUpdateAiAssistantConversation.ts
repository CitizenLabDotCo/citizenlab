import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import aiAssistantConversationsKeys from './keys';
import {
  IAiAssistantConversation,
  IAiAssistantConversationUpdate,
} from './types';

const updateConversation = ({
  id,
  autoApprove,
}: IAiAssistantConversationUpdate) =>
  fetcher<IAiAssistantConversation>({
    path: `/ai_assistant_conversations/${id}`,
    action: 'patch',
    body: { ai_assistant_conversation: { auto_approve: autoApprove } },
  });

const useUpdateAiAssistantConversation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IAiAssistantConversation,
    CLErrors,
    IAiAssistantConversationUpdate
  >({
    mutationFn: updateConversation,
    // The response has the messages too, so it can replace the cached conversation.
    onSuccess: (conversation) => {
      queryClient.setQueryData(
        aiAssistantConversationsKeys.item({ id: conversation.data.id }),
        conversation
      );
    },
  });
};

export default useUpdateAiAssistantConversation;
