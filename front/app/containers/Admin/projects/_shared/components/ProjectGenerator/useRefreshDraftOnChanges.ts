import { useEffect } from 'react';

import { getToolCalls } from 'api/ai_assistant_conversations/constructTranscript';
import { IAiAssistantConversation } from 'api/ai_assistant_conversations/types';

import { getAppliedChanges } from './draft';
import useRefreshDraft from './useRefreshDraft';

// The backend applies the changes, right away or once approved, so the draft is fetched again
// whenever the conversation shows another applied change.
const useRefreshDraftOnChanges = (conversation?: IAiAssistantConversation) => {
  const refreshDraft = useRefreshDraft();
  const appliedChangeCount = conversation
    ? getAppliedChanges(getToolCalls(conversation)).length
    : 0;

  useEffect(() => {
    if (appliedChangeCount > 0) refreshDraft();
  }, [appliedChangeCount, refreshDraft]);
};

export default useRefreshDraftOnChanges;
