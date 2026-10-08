export interface IAiAssistantMessageData {
  id: string;
  type: 'ai_assistant_message';
  attributes: {
    role: 'user' | 'assistant';
    content: string | null;
    position: number;
    created_at: string;
  };
}

export interface IAiAssistantMessage {
  data: IAiAssistantMessageData;
}

export interface IAiAssistantMessageAdd {
  conversationId: string;
  content: string;
}
