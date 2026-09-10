import { SerializedNodes } from '@craftjs/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import reportChatKeys from './keys';
import { IReportChat } from './types';

type SendParams = {
  reportId: string;
  message: string;
  // The layout as it stands in the editor. The model revises this, so the admin
  // never has to save before asking for a change.
  craftjsJson: SerializedNodes;
};

// Adds the admin's turn and starts the model's, which runs in the background.
// The response already carries the transcript with the new turn on it.
const sendMessage = ({ reportId, message, craftjsJson }: SendParams) =>
  fetcher<IReportChat>({
    path: `/reports/${reportId}/chat`,
    action: 'post',
    body: { message, craftjs_json: craftjsJson },
  });

const useSendReportChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation<IReportChat, CLErrors, SendParams>({
    mutationFn: sendMessage,
    onSuccess: (chat, { reportId }) => {
      queryClient.setQueryData(reportChatKeys.item({ reportId }), chat);
    },
  });
};

export default useSendReportChatMessage;
