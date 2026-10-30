import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import aiAssistantConversationsKeys from './keys';
import { IAiAssistantConversation, IAiAssistantConversationAdd } from './types';

const addConversation = ({
  surfaceKey,
  subjectId,
  locale,
}: IAiAssistantConversationAdd) =>
  fetcher<IAiAssistantConversation>({
    path: '/ai_assistant_conversations',
    action: 'post',
    body: {
      ai_assistant_conversation: {
        surface_key: surfaceKey,
        subject_id: subjectId,
        locale,
      },
    },
  });

const useAddAiAssistantConversation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IAiAssistantConversation,
    CLErrors,
    IAiAssistantConversationAdd
  >({
    mutationFn: addConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: aiAssistantConversationsKeys.lists(),
      });
    },
  });
};

export default useAddAiAssistantConversation;
