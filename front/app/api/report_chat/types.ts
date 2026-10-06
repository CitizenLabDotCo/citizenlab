import { Keys } from 'utils/cl-react-query/types';

import reportChatKeys from './keys';

export type ReportChatKeys = Keys<typeof reportChatKeys>;

export interface ReportChatTurn {
  role: 'user' | 'assistant';
  text: string;
  at: string;
  // Only on an assistant turn: whether it rewrote the report's layout.
  changed_layout?: boolean;
}

export interface IReportChat {
  data: {
    id: string;
    type: 'report_chat';
    attributes: {
      turns: ReportChatTurn[];
      // True while the model still owes an answer to the last turn.
      pending: boolean;
    };
  };
}
