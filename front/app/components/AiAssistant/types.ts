import { ComponentType } from 'react';

import { MessageDescriptor } from 'react-intl';

// How a feature presents one of its tools in the assistant panel.
export type AiAssistantToolView = {
  label: MessageDescriptor;
  // Shows what an approved call would do, from the arguments the model proposed.
  Preview?: ComponentType<{ args: Record<string, unknown> }>;
  approveWarning?: MessageDescriptor;
};

export type AiAssistantToolViews = Record<string, AiAssistantToolView>;
