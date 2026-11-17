import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import aiAssistantConversationsKeys from 'api/ai_assistant_conversations/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import { IAiAssistantMessage, IAiAssistantMessageAdd } from './types';

const addMessage = ({
  conversationId,
  content,
  fileIds,
}: IAiAssistantMessageAdd) =>
  fetcher<IAiAssistantMessage>({
    path: `/ai_assistant_conversations/${conversationId}/messages`,
    action: 'post',
    body: { ai_assistant_message: { content, file_ids: fileIds } },
  });

const useAddAiAssistantMessage = () => {
  const queryClient = useQueryClient();

  return useMutation<IAiAssistantMessage, CLErrors, IAiAssistantMessageAdd>({
    mutationFn: addMessage,
    onSuccess: (_message, { conversationId }) => {
      // Starts the polling of the assistant's turn.
      queryClient.invalidateQueries({
        queryKey: aiAssistantConversationsKeys.item({ id: conversationId }),
      });
    },
  });
};

export default useAddAiAssistantMessage;
