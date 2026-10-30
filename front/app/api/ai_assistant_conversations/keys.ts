import { QueryKeys } from 'utils/cl-react-query/types';

import { AiAssistantSurfaceKey } from './types';

const baseKey = { type: 'ai_assistant_conversation' };

const aiAssistantConversationsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: {
    surfaceKey: AiAssistantSurfaceKey;
    subjectId: string;
  }) => [{ ...baseKey, operation: 'list', parameters }],
  items: () => [{ ...baseKey, operation: 'item' }],
  // Not just `{ id }`: the fetcher caches that key with the bare conversation, without `included`.
  item: ({ id }: { id?: string }) => [
    { ...baseKey, operation: 'item', parameters: { id, include: 'messages' } },
  ],
} satisfies QueryKeys;

export default aiAssistantConversationsKeys;
