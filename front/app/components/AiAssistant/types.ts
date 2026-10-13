import { MessageDescriptor } from 'react-intl';

// How a feature presents one of its tools in the assistant panel.
export type AiAssistantToolView = {
  label: MessageDescriptor;
};

export type AiAssistantToolViews = Record<string, AiAssistantToolView>;
