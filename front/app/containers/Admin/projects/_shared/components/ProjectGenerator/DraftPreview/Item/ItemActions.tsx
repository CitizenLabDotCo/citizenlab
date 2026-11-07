import React from 'react';

import { AiAssistantConversationStatus } from 'api/ai_assistant_conversations/types';

import { ProposedChange } from '../../draft';

import ApprovalActions from './ApprovalActions';
import RequestChange from './RequestChange';

type Props = {
  change?: ProposedChange;
  // Without a conversation, the item only shows what is saved.
  conversationId?: string;
  status?: AiAssistantConversationStatus;
  toMessage: (request: string) => string;
};

const ItemActions = ({ change, conversationId, status, toMessage }: Props) => {
  if (!conversationId || !status) return null;

  if (change) {
    return status === 'awaiting_user' ? (
      <ApprovalActions change={change} conversationId={conversationId} />
    ) : null;
  }

  if (status === 'idle' || status === 'failed') {
    return (
      <RequestChange conversationId={conversationId} toMessage={toMessage} />
    );
  }

  return null;
};

export default ItemActions;
