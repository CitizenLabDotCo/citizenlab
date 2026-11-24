import { AiAssistantSurfaceKey } from 'api/ai_assistant_conversations/types';
import useAiAssistantConversation from 'api/ai_assistant_conversations/useAiAssistantConversation';
import useAiAssistantConversations from 'api/ai_assistant_conversations/useAiAssistantConversations';

type Parameters = { surfaceKey: AiAssistantSurfaceKey; subjectId: string };

// The current user's latest conversation on a surface, refreshed while the assistant
// works.
const useLatestConversation = (
  { surfaceKey, subjectId }: Parameters,
  { enabled = true }: { enabled?: boolean } = {}
) => {
  const { data: conversations } = useAiAssistantConversations(
    { surfaceKey, subjectId, pageSize: 1 },
    { enabled }
  );
  const conversationId = conversations?.data.at(0)?.id;
  const { data: conversation } = useAiAssistantConversation(conversationId);

  return { conversationId, conversation };
};

export default useLatestConversation;
