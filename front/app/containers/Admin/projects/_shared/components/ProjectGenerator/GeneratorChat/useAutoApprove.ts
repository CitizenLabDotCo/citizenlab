import { useState } from 'react';

import { IAiAssistantConversation } from 'api/ai_assistant_conversations/types';
import useUpdateAiAssistantConversation from 'api/ai_assistant_conversations/useUpdateAiAssistantConversation';

// Whether the assistant applies its changes without asking. The conversation stores the
// choice; until the first message starts the conversation, it is kept here.
const useAutoApprove = (conversation?: IAiAssistantConversation) => {
  const [choiceBeforeConversation, setChoiceBeforeConversation] =
    useState(false);
  const {
    mutate: updateConversation,
    isPending,
    variables,
  } = useUpdateAiAssistantConversation();

  const getAutoApprove = () => {
    if (!conversation) return choiceBeforeConversation;
    // Shows the new choice while it is being saved.
    if (isPending) return variables.autoApprove;
    return conversation.data.attributes.auto_approve;
  };

  const setAutoApprove = (autoApprove: boolean) => {
    if (conversation) {
      updateConversation({ id: conversation.data.id, autoApprove });
    } else {
      setChoiceBeforeConversation(autoApprove);
    }
  };

  return { autoApprove: getAutoApprove(), setAutoApprove };
};

export default useAutoApprove;
