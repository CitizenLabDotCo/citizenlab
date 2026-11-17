import { IRelationship } from 'typings';

export interface IAiAssistantMessageData {
  id: string;
  type: 'ai_assistant_message';
  attributes: {
    role: 'user' | 'assistant';
    content: string | null;
    file_ids: string[];
    position: number;
    created_at: string;
  };
  relationships: {
    tool_calls: { data: IRelationship[] };
  };
}

export interface IAiAssistantMessage {
  data: IAiAssistantMessageData;
}

export interface IAiAssistantMessageAdd {
  conversationId: string;
  content: string;
  fileIds: string[];
}
